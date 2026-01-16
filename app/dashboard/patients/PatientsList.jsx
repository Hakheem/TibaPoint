"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PatientsList({ patients }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Consultations</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.imageUrl} />
                        <AvatarFallback>
                          {patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.gender}
                          {patient.dob && `, ${calculateAge(patient.dob)} yrs`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {patient.email}
                      </span>
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {patient.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {patient.totalConsultations} visits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(patient.lastConsultation).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Patient Details</DialogTitle>
                          <DialogDescription>
                            Complete history and information for {patient.name}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden flex flex-col gap-6 py-4">
                          {/* Patient Header Info */}
                          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={patient.imageUrl} />
                              <AvatarFallback className="text-lg">
                                {patient.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {patient.name}
                                </h3>
                                {patient.dob && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> DOB:{" "}
                                    {new Date(patient.dob).toLocaleDateString()}{" "}
                                    ({calculateAge(patient.dob)} yrs)
                                  </p>
                                )}
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground" />{" "}
                                  {patient.email}
                                </div>
                                {patient.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                                    {patient.phone}
                                  </div>
                                )}
                                {patient.address && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />{" "}
                                    {patient.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Consultation History */}
                          <div className="flex-1 overflow-hidden flex flex-col">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Consultation
                              History
                            </h4>
                            <ScrollArea className="flex-1 pr-4 h-full">
                              <div className="space-y-4 h-full overflow-auto ">
                                {(
                                  patient.history &&
                                  [...patient.history].sort(
                                    (a, b) =>
                                      new Date(b.startTime) -
                                      new Date(a.startTime)
                                  )
                                )?.map((apt) => (
                                  <Card key={apt.id}>
                                    <CardHeader className="py-3 bg-muted/30">
                                      <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">
                                          {new Date(
                                            apt.startTime
                                          ).toLocaleDateString()}{" "}
                                          at{" "}
                                          {new Date(
                                            apt.startTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </CardTitle>
                                        <Badge
                                          variant={
                                            apt.status === "COMPLETED"
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {apt.status}
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="py-3 space-y-2 text-sm">
                                      {apt.reason && (
                                        <div>
                                          <span className="font-medium text-muted-foreground">
                                            Reason:{" "}
                                          </span>
                                          {apt.reason}
                                        </div>
                                      )}
                                      {apt.diagnosis && (
                                        <div>
                                          <span className="font-medium text-muted-foreground">
                                            Diagnosis:{" "}
                                          </span>
                                          {apt.diagnosis}
                                        </div>
                                      )}
                                      {apt.prescription && (
                                        <div>
                                          <span className="font-medium text-muted-foreground">
                                            Prescription:{" "}
                                          </span>
                                          {apt.prescription}
                                        </div>
                                      )}
                                      {apt.notes && (
                                        <div>
                                          <span className="font-medium text-muted-foreground">
                                            Notes:{" "}
                                          </span>
                                          {apt.notes}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function calculateAge(dob) {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
