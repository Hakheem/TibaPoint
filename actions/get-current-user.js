"use server";

import { checkUser } from '@/lib/checkUser';

export async function getCurrentUser() {
  try {
    const user = await checkUser();
    return {
      success: true,
      user: user || null
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
