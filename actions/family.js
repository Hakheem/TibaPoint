"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addFamilyMember(
  memberId,
  relationship = "other",
  nickname = null
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const owner = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    if (!owner) return { success: false, error: "User not found" };

    if (owner.id === memberId)
      return { success: false, error: "Cannot add yourself as family member" };

    // Create family member entry
    const fm = await db.familyMember.create({
      data: {
        ownerId: owner.id,
        memberId,
        relationship,
        nickname,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true, familyMember: fm };
  } catch (error) {
    console.error("Failed to add family member:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFamilyMember(memberId) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const owner = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    if (!owner) return { success: false, error: "User not found" };

    const deleted = await db.familyMember.deleteMany({
      where: { ownerId: owner.id, memberId },
    });

    revalidatePath("/dashboard/profile");
    return { success: true, deleted: deleted.count };
  } catch (error) {
    console.error("Failed to remove family member:", error);
    return { success: false, error: error.message };
  }
}

export async function listMyFamilyMembers() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const owner = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    if (!owner) return { success: false, error: "User not found" };

    const members = await db.familyMember.findMany({
      where: { ownerId: owner.id },
      include: { member: { select: { id: true, name: true, email: true } } },
    });

    return { success: true, members };
  } catch (error) {
    console.error("Failed to list family members:", error);
    return { success: false, error: error.message };
  }
}
