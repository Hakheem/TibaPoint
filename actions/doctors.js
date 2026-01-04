"use server";

import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server' 
import { revalidatePath } from 'next/cache'


export async function getDoctorsBySpeciality(speciality) {
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        speciality: speciality,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { doctors };
  } catch (error) {
    console.error("Failed to fetch doctors by speciality:", error);
    return { error: "Failed to fetch doctors" };
  }
}

export async function setAvailabilitySlots(formData){
  const {userId} = await auth()

  if(!userId){
    throw new Error("Unauthorized")
  }
  
      try{
const doctor = await prisma.findUnique({
    where: {
        clerkUserId: userId,
        role: "DOCTOR",
    },
})
  if(!doctor){
    throw new Error("Doctor not found")
  }

//   get form data
const startTime = formData.get("startTime")
const endTime = formData.get("endTime")

if(!startTime || !endTime ){
    throw new Error("Start time and end time are required")
}
if(!startTime >= !endTime ){
    throw new Error("Start time must to be before end time")
}
const existingSlots = await db.availability.findMany({
    where:{
        doctorId: doctor.id,
    },
})

if(existingSlots.length > 0){
    const slotsWithAppointments = existngSlots.filter(
        (slot)=> !slot.appointment
    )

    if(slotsWithAppointments.length >0){
        await prisma.availability.deleteMany({
            where:{
                id:{
in: slotsWithAppointments.map((slot)=> slot.id ),
                },
            }
        })
    }
}

// create new slot
const newSlot = await prisma.availability.create({
    data:{
    doctorId: doctor.id,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    status: "AVAILABLE"}
})


revalidatePath("/doctor")
return {success: true, slot: newSlot}

    }catch(error){
throw new Error('Failed to set availability: ' + error.message)
    }
}



export async function getDoctorAvailability(){
  const {userId} = await auth()

  if(!userId){
    throw new Error("Unauthorized")
  }
  
      try{
const doctor = await prisma.findUnique({
    where: {
        clerkUserId: userId,
        role: "DOCTOR",
    },
})
  if(!doctor){
    throw new Error("Doctor not found")
  }

const availabilitySlots = await prisma.availabilty.findMany({
    where:{
        doctorId: doctor.id,
    }, 
    orderBy:{
        startTime: 'asc'
    }
})


return { slots: availabilitySlots}

    }catch(error){
throw new Error('Failed to fetch availability slots: ' + error.message)
    }
}


