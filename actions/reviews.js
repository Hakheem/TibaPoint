"use server";

import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(appointmentId, rating, comment, isPublic = true) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Check if appointment exists and belongs to this patient
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    });

    if (!appointment || appointment.patientId !== patient.id) {
      return { success: false, error: "Appointment not found or unauthorized" };
    }

    // Check if appointment is completed
    if (appointment.status !== "COMPLETED") {
      return { success: false, error: "Can only review completed appointments" };
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { appointmentId },
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this appointment" };
    }

    // Create review
    const review = await db.review.create({
      data: {
        appointmentId,
        patientId: patient.id,
        doctorId: appointment.doctorId,
        rating,
        comment: comment || null,
        isPublic,
      },
    });

    // Update doctor's overall rating
    const allReviews = await db.review.findMany({
      where: { doctorId: appointment.doctorId },
      select: { rating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await db.user.update({
      where: { id: appointment.doctorId },
      data: {
        rating: averageRating,
        totalReviews: allReviews.length,
      },
    });

    // Create detailed notification for doctor
    const emoji = rating >= 4 ? "⭐" : rating >= 3 ? "✨" : "📝";
    const ratingText = `${rating}/5 star${rating !== 1 ? 's' : ''}`;
    const truncatedComment = comment 
      ? (comment.length > 100 ? comment.substring(0, 100) + '...' : comment)
      : 'No comment provided.';
    
    await db.notification.create({
      data: {
        userId: appointment.doctorId,
        type: "REVIEW",
        title: `${emoji} New ${ratingText} Review`,
        message: `${patient.name} rated your consultation ${ratingText}. Review: "${truncatedComment}"`,
        actionUrl: `/dashboard/reviews`,
        relatedId: review.id,
      },
    });

    // Also update the appointment to mark it as reviewed
    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        hasReview: true,
      },
    });

    revalidatePath(`/appointments/${appointmentId}`);
    revalidatePath(`/dashboard/reviews`);
    revalidatePath(`/doctors/${appointment.doctorId}`);

    return {
      success: true,
      review,
      message: "Review submitted successfully"
    };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

*
 * Get reviews for a specific doctor (public view)
 */
export async function getDoctorReviews(doctorId, limit = 10, page = 1) {
  try {
    const skip = (page - 1) * limit;

    const reviews = await db.review.findMany({
      where: {
        doctorId,
        isPublic: true,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalReviews = await db.review.count({
      where: {
        doctorId,
        isPublic: true,
      },
    });

    return {
      success: true,
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch doctor reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

/**
 * Get patient's own reviews
 */
export async function getPatientReviews(filter = "all") {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    let whereClause = { patientId: patient.id };

    // Filter by rating if specified (e.g., "high" = 4-5, "low" = 1-2)
    if (filter === "high") {
      whereClause.rating = { gte: 4 };
    } else if (filter === "low") {
      whereClause.rating = { lte: 2 };
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            speciality: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error("Failed to fetch patient reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

/**
 * Get doctor's received reviews
 */
export async function getDoctorReceivedReviews(filter = "all") {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    let whereClause = { doctorId: doctor.id };

    // Filter by rating if specified
    if (filter === "high") {
      whereClause.rating = { gte: 4 };
    } else if (filter === "low") {
      whereClause.rating = { lte: 2 };
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      success: true,
      reviews,
      statistics: {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Failed to fetch doctor reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

/**
 * Get all reviews (admin view)
 */
export async function getAllReviews(search = "", page = 1, limit = 20) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * limit;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        {
          patient: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          doctor: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          comment: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            speciality: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalReviews = await db.review.count({
      where: whereClause,
    });

    return {
      success: true,
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch all reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

/**
 * Update a review (patient can update their own review)
 */
export async function updateReview(reviewId, rating, comment, isPublic = null) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        doctor: true,
      },
    });

    if (!review || review.patientId !== patient.id) {
      return { success: false, error: "Review not found or unauthorized" };
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (isPublic !== null) updateData.isPublic = isPublic;

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    // If rating changed, update doctor's overall rating
    if (rating !== undefined && rating !== review.rating) {
      const allReviews = await db.review.findMany({
        where: { doctorId: review.doctorId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await db.user.update({
        where: { id: review.doctorId },
        data: {
          rating: averageRating,
        },
      });
    }

    revalidatePath(`/appointments/${review.appointmentId}`);
    revalidatePath(`/dashboard/reviews`);

    return {
      success: true,
      review: updatedReview,
      message: "Review updated successfully"
    };
  } catch (error) {
    console.error("Failed to update review:", error);
    return { success: false, error: "Failed to update review" };
  }
}

/**
 * Delete a review (patient can delete their own review, admin can delete any)
 */
export async function deleteReview(reviewId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        doctor: true,
      },
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    // Check permissions
    const isPatientOwner = user.role === "PATIENT" && user.id === review.patientId;
    const isAdmin = user.role === "ADMIN";

    if (!isPatientOwner && !isAdmin) {
      return { success: false, error: "Unauthorized to delete this review" };
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    // Update doctor's rating after deletion
    const remainingReviews = await db.review.findMany({
      where: { doctorId: review.doctorId },
      select: { rating: true },
    });

    const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = remainingReviews.length > 0 
      ? totalRating / remainingReviews.length 
      : 0;

    await db.user.update({
      where: { id: review.doctorId },
      data: {
        rating: averageRating,
        totalReviews: remainingReviews.length,
      },
    });

    revalidatePath(`/appointments/${review.appointmentId}`);
    revalidatePath(`/dashboard/reviews`);

    return {
      success: true,
      message: "Review deleted successfully"
    };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

/**
 * Toggle review visibility (admin only)
 */
export async function toggleReviewVisibility(reviewId, isPublic) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: { isPublic },
    });

    revalidatePath(`/dashboard/reviews`);
    revalidatePath(`/doctors/${review.doctorId}`);

    return {
      success: true,
      review: updatedReview,
      message: `Review ${isPublic ? 'made public' : 'hidden'} successfully`
    };
  } catch (error) {
    console.error("Failed to toggle review visibility:", error);
    return { success: false, error: "Failed to update review visibility" };
  }
}

