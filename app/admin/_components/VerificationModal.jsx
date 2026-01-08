"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPin,
  Phone,
  FileText,
  User,
  Award,
  Shield,
} from "lucide-react";

const VerificationModal = ({
  isOpen,
  onClose,
  doctor,
  onConfirm,
  isVerifying,
}) => {
  const [notes, setNotes] = useState("");

  // Reset notes when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes(""); // Clear notes after confirmation
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Confirm Doctor Verification
          </DialogTitle>
          <DialogDescription>
            Review the doctor's information before approving verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {doctor.imageUrl ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {doctor.speciality && (
                    <Badge variant="outline" className="bg-blue-50">
                      {doctor.speciality}
                    </Badge>
                  )}
                  {doctor.experience && (
                    <Badge variant="outline" className="bg-green-50">
                      {doctor.experience} years experience
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Section */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Professional Credentials
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* License Number */}
              <div className="bg-white border rounded-lg p-4">
                <Label className="text-sm text-gray-500">
                  Medical License Number
                </Label>
                <p className="font-medium mt-1 font-mono">
                  {doctor.licenseNumber || "Not provided"}
                </p>
              </div>

              {/* Experience */}
              <div className="bg-white border rounded-lg p-4">
                <Label className="text-sm text-gray-500">
                  Years of Experience
                </Label>
                <p className="font-medium mt-1">
                  {doctor.experience || "0"} years
                </p>
              </div>

              {/* Phone */}
              {doctor.phone && (
                <div className="bg-white border rounded-lg p-4">
                  <Label className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <p className="font-medium mt-1">{doctor.phone}</p>
                </div>
              )}

              {/* City */}
              {doctor.city && (
                <div className="bg-white border rounded-lg p-4">
                  <Label className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    City
                  </Label>
                  <p className="font-medium mt-1">{doctor.city}</p>
                </div>
              )}

              {/* Application Date */}
              <div className="bg-white border rounded-lg p-4">
                <Label className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Application Date
                </Label>
                <p className="font-medium mt-1">
                  {formatDate(doctor.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          {doctor.bio && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Professional Bio
              </Label>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {doctor.bio}
                </p>
              </div>
            </div>
          )}

          {/* Credential Document */}
          {doctor.credentialUrl && (
            <div className="space-y-2">
              <Label>Medical License/Certificate Document</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <img
                    src={doctor.credentialUrl}
                    alt="Medical credential"
                    className="max-h-64 max-w-full rounded object-contain"
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Uploaded medical license/certificate
                </p>
              </div>
            </div>
          )}

          {/* Notes for Doctor (optional) */}
          <div className="space-y-2">
            <Label htmlFor="verification-notes">
              Add Verification Notes (Optional)
            </Label>
            <textarea
              id="verification-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or instructions for the doctor..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              These notes will be included in the verification notification sent
              to the doctor.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Confirm Verification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;
