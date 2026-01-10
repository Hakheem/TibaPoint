"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Admin function to add family member
export async function addFamilyMemberAsAdmin(ownerId, memberId, relationship = "other", nickname = null) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (admin?.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const [owner, member] = await Promise.all([
      db.user.findUnique({
        where: { id: ownerId, role: "PATIENT" },
      }),
      db.user.findUnique({
        where: { id: memberId, role: "PATIENT" },
      }),
    ]);

    if (!owner || !member) {
      return { success: false, error: "One or both users not found" };
    }

    if (ownerId === memberId) {
      return { success: false, error: "Cannot add self as family member" };
    }

    const existingRelationship = await db.familyMember.findFirst({
      where: {
        ownerId,
        memberId,
      },
    });

    if (existingRelationship) {
      return { success: false, error: "Family member already exists" };
    }

    const existingMembership = await db.familyMember.findFirst({
      where: {
        memberId,
      },
    });

    if (existingMembership) {
      return { 
        success: false, 
        error: "This patient is already a family member of another user" 
      };
    }

    const familyMember = await db.familyMember.create({
      data: {
        ownerId,
        memberId,
        relationship,
        nickname,
      },
    });

    const familyPackage = await db.creditPackage.findFirst({
      where: {
        userId: ownerId,
        packageType: "FAMILY",
        status: "ACTIVE",
      },
    });

    await Promise.all([
      db.notification.create({
        data: {
          userId: ownerId,
          type: "FAMILY",
          title: "Family Member Added",
          message: `${member.name} has been added to your family members by an administrator. ${familyPackage ? "They can now use credits from your Family package." : "Consider purchasing a Family package to share credits with them."}`,
        },
      }),
      db.notification.create({
        data: {
          userId: memberId,
          type: "FAMILY",
          title: "Added as Family Member",
          message: `You have been added as a family member to ${owner.name} by an administrator. ${familyPackage ? "You can now use credits from their Family package." : "They need to purchase a Family package for you to use shared credits."}`,
        },
      }),
    ]);

    await db.adminLog.create({
      data: {
        adminId: admin.id,
        action: "ADD_FAMILY_MEMBER",
        targetType: "user",
        targetId: ownerId,
        metadata: {
          memberId,
          memberName: member.name,
          relationship,
          nickname,
        },
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, familyMember };
  } catch (error) {
    console.error("Failed to add family member:", error);
    return { success: false, error: error.message };
  }
}

// Admin function to remove family member
export async function removeFamilyMemberAsAdmin(ownerId, familyMemberId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (admin?.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const familyMember = await db.familyMember.findFirst({
      where: {
        id: familyMemberId,
        ownerId,
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!familyMember) {
      return { success: false, error: "Family member not found" };
    }

    const deleted = await db.familyMember.delete({
      where: {
        id: familyMemberId,
      },
    });

    await Promise.all([
      db.notification.create({
        data: {
          userId: ownerId,
          type: "FAMILY",
          title: "Family Member Removed",
          message: `${familyMember.member.name} has been removed from your family members by an administrator.`,
        },
      }),
      db.notification.create({
        data: {
          userId: familyMember.memberId,
          type: "FAMILY",
          title: "Removed as Family Member",
          message: `You have been removed as a family member from ${familyMember.member.name} by an administrator.`,
        },
      }),
    ]);

    await db.adminLog.create({
      data: {
        adminId: admin.id,
        action: "REMOVE_FAMILY_MEMBER",
        targetType: "user",
        targetId: ownerId,
        metadata: {
          familyMemberId,
          memberId: familyMember.memberId,
          memberName: familyMember.member.name,
        },
      },
    });

    revalidatePath("/admin/patients");
    return { success: true, deleted };
  } catch (error) {
    console.error("Failed to remove family member:", error);
    return { success: false, error: error.message };
  }
}
