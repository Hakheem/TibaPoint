import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET || "your-secret-key";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find last cron run recorded in admin logs
    const lastRun = await prisma.adminLog.findFirst({
      where: { action: "CRON_PROCESS_PAYOUT" },
      orderBy: { createdAt: "desc" },
    });

    const lastRunTime = lastRun?.createdAt || new Date(0);

    // Find appointments completed since last run
    const recentCompleted = await prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { gt: lastRunTime },
      },
      select: {
        doctorId: true,
        doctorEarnings: true,
      },
    });

    // Aggregate by doctor
    const totalsByDoctor = {};
    for (const apt of recentCompleted) {
      if (!apt.doctorId) continue;
      totalsByDoctor[apt.doctorId] =
        (totalsByDoctor[apt.doctorId] || 0) + (apt.doctorEarnings || 0);
    }

    const results = [];
    let totalPayout = 0;

    for (const [doctorId, amount] of Object.entries(totalsByDoctor)) {
      const rounded = Math.round(amount);
      if (rounded <= 0) continue;

      await prisma.user.update({
        where: { id: doctorId },
        data: { creditBalance: { increment: rounded } },
      });

      await prisma.notification.create({
        data: {
          userId: doctorId,
          type: "SYSTEM",
          title: "Payout Added",
          message: `Your earnings of ${rounded} KSH have been added to your available balance.`,
          actionUrl: "/dashboard/earnings",
          relatedId: doctorId,
        },
      });

      results.push({ doctorId, amount: rounded });
      totalPayout += rounded;
    }

    // Record admin log for audit (no admin id available when cron runs)
    await prisma.adminLog.create({
      data: {
        adminId: "CRON",
        action: "CRON_PROCESS_PAYOUT",
        targetType: "system",
        targetId: "CRON_PROCESS_PAYOUT",
        reason: "Automated payout run",
        metadata: { processedAt: now.toISOString(), totalPayout, results },
      },
    });

    return NextResponse.json({ success: true, totalPayout, results });
  } catch (error) {
    console.error("Update doctors balance cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error?.message },
      { status: 500 }
    );
  }
}

// Manual trigger
export async function POST(req) {
  return GET(req);
}
