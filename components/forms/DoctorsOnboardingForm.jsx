// components/forms/DoctorOnboardingForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setUserRole } from '@/onboarding'
import { Loader2, Upload, X } from 'lucide-react'

const SPECIALITIES = [
  'General Practice',
  'Pediatrics',
  'Internal Medicine',
  'Obstetrics & Gynecology',
  'Surgery',
  'Psychiatry',
  'Dermatology',
  'Cardiology',
  'Orthopedics',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
  'Dentistry',
  'Other'
]

export default function DoctorOnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credentialFile, setCredentialFile] = useState(null)
  const [credentialPreview, setCredentialPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, credential: 'Please upload an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, credential: 'File size must be less than 5MB' })
      return
    }

    setCredentialFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCredentialPreview(reader.result)
    }
    reader.readAsDataURL(file)

    setErrors({ ...errors, credential: '' })
  }

  const removeFile = () => {
    setCredentialFile(null)
    setCredentialPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.append('role', 'DOCTOR')

    // Convert image to base64 and compress
    if (credentialFile) {
      const base64 = await compressAndConvertToBase64(credentialFile)
      formData.set('credentialUrl', base64)
    }

    const result = await setUserRole(formData)

    if (result.success) {
      router.push(result.redirect)
    } else {
      alert(result.error || 'Something went wrong')
      setLoading(false)
    }
  }

  // Compress and convert image to base64
  const compressAndConvertToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Calculate new dimensions (max 1200px width)
          let width = img.width
          let height = img.height
          const maxWidth = 1200

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          const base64 = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
          resolve(base64)
        }
        img.onerror = reject
        img.src = e.target?.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Doctor Registration</CardTitle>
        <CardDescription>
          Complete your professional profile. All information will be verified by our team.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Speciality */}
          <div className="space-y-2">
            <Label htmlFor="speciality">Speciality *</Label>
            <Select name="speciality" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your speciality" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALITIES.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
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
              name="experience"
              id="experience"
              min="0"
              max="50"
              required
              placeholder="e.g., 5"
            />
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Medical License Number *</Label>
            <Input
              type="text"
              name="licenseNumber"
              id="licenseNumber"
              required
              placeholder="e.g., KMP/12345"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              type="tel"
              name="phone"
              id="phone"
              required
              placeholder="e.g., +254712345678"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              type="text"
              name="city"
              id="city"
              required
              placeholder="e.g., Nairobi"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio *</Label>
            <Textarea
              name="bio"
              id="bio"
              required
              rows={4}
              placeholder="Tell us about your medical background, expertise, and what patients can expect from your consultations..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your public profile
            </p>
          </div>

          {/* Credential Upload */}
          <div className="space-y-2">
            <Label>Medical License/Certificate *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {credentialPreview ? (
                <div className="relative">
                  <img
                    src={credentialPreview}
                    alt="Credential preview"
                    className="max-h-48 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <Label
                      htmlFor="credential"
                      className="cursor-pointer text-primary hover:underline"
                    >
                      Click to upload
                    </Label>
                    <Input
                      type="file"
                      id="credential"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
            {errors.credential && (
              <p className="text-sm text-destructive">{errors.credential}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !credentialFile}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting for verification...
              </>
            ) : (
              'Submit for Verification'
            )}
          </Button> 

          <p className="text-xs text-center text-muted-foreground">
            Your profile will be reviewed within 24-48 hours
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
