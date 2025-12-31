'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { updateDoctorProfile } from '@/actions/admin'
import { Loader2 } from 'lucide-react'

const SPECIALITIES = [
  'General Practice',
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Surgery',
  'Orthopedics',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Dermatology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
  'Dentistry',
  'Urology',
  'Nephrology',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Rheumatology',
  'Oncology',
  'Hematology',
  'Infectious Diseases',
  'Allergy & Immunology',
  'Pathology',
  'Radiology',
  'Anesthesiology',
  'Emergency Medicine',
  'Physical Medicine & Rehabilitation',
  'Preventive Medicine',
  'Sports Medicine',
  'Telemedicine',
  'Alternative Medicine',
  'Other'
]

const UpdateDoctorModal = ({ doctor, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    speciality: doctor.speciality || '',
    experience: doctor.experience || 0,
    bio: doctor.bio || '',
    consultationFee: doctor.consultationFee || 2,
    licenseNumber: doctor.licenseNumber || '',
    credentialUrl: doctor.credentialUrl || '',
    phone: doctor.phone || '',
    city: doctor.city || '',
    country: doctor.country || 'Kenya'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' || name === 'consultationFee' 
        ? parseInt(value) || 0 
        : value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.speciality || !formData.experience || !formData.licenseNumber) {
      toast.error('Missing required fields', {
        description: 'Speciality, Experience, and License Number are required'
      })
      return
    }

    if (formData.experience < 0 || formData.experience > 50) {
      toast.error('Invalid experience', {
        description: 'Experience must be between 0 and 50 years'
      })
      return
    }

    if (formData.consultationFee < 1 || formData.consultationFee > 10) {
      toast.error('Invalid consultation fee', {
        description: 'Consultation fee must be between 1 and 10 credits'
      })
      return
    }

    setLoading(true)
    try {
      const result = await updateDoctorProfile(doctor.id, formData)
      
      if (result.success) {
        toast.success('Profile Updated', {
          description: 'Doctor profile has been updated successfully'
        })
        onSuccess()
      } else {
        toast.error('Update Failed', {
          description: result.error || 'Failed to update doctor profile'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Doctor Profile</DialogTitle>
          <DialogDescription>
            Update the profile information for {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Speciality */}
            <div className="space-y-2">
              <Label htmlFor="speciality">Speciality *</Label>
              <Select
                value={formData.speciality}
                onValueChange={(value) => handleSelectChange('speciality', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speciality" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALITIES.map((speciality) => (
                    <SelectItem key={speciality} value={speciality}>
                      {speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                max="50"
                required
              />
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Consultation Fee */}
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (credits) *</Label>
              <Input
                type="number"
                id="consultationFee"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                min="1"
                max="10"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Credential URL */}
          <div className="space-y-2">
            <Label htmlFor="credentialUrl">Credential Document URL</Label>
            <Input
              id="credentialUrl"
              name="credentialUrl"
              value={formData.credentialUrl}
              onChange={handleChange}
              placeholder="https://example.com/credential.jpg"
            />
            {formData.credentialUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Current credential:</p>
                <a
                  href={formData.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the doctor's background, expertise, and experience..."
            />
            <p className="text-xs text-gray-500">
              This will be displayed on the doctor's public profile
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The doctor will receive a notification about this profile update.
              Changes will be reflected immediately across the platform.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateDoctorModal

