import React from "react";
import { getDoctorAppointments } from "@/actions/doctors";
import { checkUser } from "@/lib/checkUser";
import PatientsList from "./PatientsList";

const PatientsPage = async () => {
  const user = await checkUser();

  let patients = [];

  if (user) {
    const { success, appointments } = await getDoctorAppointments(user.id);

    if (success && appointments) {
      const patientsMap = new Map();

      appointments.forEach((apt) => {
        if (!apt.patient) return;

        if (!patientsMap.has(apt.patient.id)) {
          patientsMap.set(apt.patient.id, {
            ...apt.patient,
            totalConsultations: 1,
            lastConsultation: apt.startTime,
            history: [apt],
          });
        } else {
          const p = patientsMap.get(apt.patient.id);
          p.totalConsultations += 1;
          p.history.push(apt);
          if (new Date(apt.startTime) > new Date(p.lastConsultation)) {
            p.lastConsultation = apt.startTime;
          }
        }
      });

      patients = Array.from(patientsMap.values());
    }
  }

  return (
    <div className="container mx-auto  ">
      
      <PatientsList patients={patients} />
    </div>
  );
};

export default PatientsPage;
