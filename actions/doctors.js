'use server'

import { prisma } from "@/lib/prisma"

export async function getDoctorsBySpeciality(speciality){
    try{
        const doctors = await prisma.user.findMany({
            where:{
                role: "DOCTOR",
                verificationStatus: "VERIFIED",
                speciality: speciality,
            },
            orderBy:{
                name:"asc"
            }
        })
        return {doctors}
    }
    catch(error){
console.error("Failed to fetch doctors by speciality:", error)
return{error: "Failed to fetch doctors"}
    }
}








