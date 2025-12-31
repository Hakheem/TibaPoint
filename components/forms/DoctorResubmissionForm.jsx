// app/doctor/verification/_components/ResubmissionForm.jsx
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
import { Card, CardContent } from '@/components/ui/card'
import { resubmitVerification } from '@/actions/doctor-verification'
import { Loader2, Upload, X, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// Import all the same icons and SVGs from your onboarding form
import {
  Heart,
  Brain,
  Baby,
  User,
  Activity,
  Eye,
  Stethoscope,
  Thermometer,
  Pill,
  Syringe,
  Shield,
  Users,
  Microscope,
  TestTube,
  Leaf,
  Award,
  Cloud,
  Smartphone,
  Scissors,
  Circle,
} from 'lucide-react'

// Same SVG components from your onboarding form
const Tooth = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C10 2 8 3 8 5v7c0 1-1 2-1 4v4c0 1 1 2 2 2s2-1 2-2v-4c0-1 0-2 1-2s1 1 1 2v4c0 1 1 2 2 2s2-1 2-2v-4c0-2-1-3-1-4V5c0-2-2-3-4-3z" />
  </svg>
)

const Ear = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8 2 5 5 5 9c0 3 1 5 2 7 1 2 2 4 2 6 0 1 1 2 2 2h2c1 0 2-1 2-2 0-2 1-4 2-6 1-2 2-4 2-7 0-4-3-7-7-7zm0 5c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" />
  </svg>
)

const Skull = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C7 2 3 6 3 11c0 4 2 7 5 8v3h8v-3c3-1 5-4 5-8 0-5-4-9-9-9zM9 11a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
)

const Kidney = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3c-3 0-5 2-6 5-1 2-1 5 0 7 1 3 3 5 6 5 2 0 3-1 4-2 1 1 2 2 4 2 3 0 5-2 6-5 1-2 1-5 0-7-1-3-3-5-6-5-2 0-3 1-4 2-1-1-2-2-4-2z" />
  </svg>
)

const Lung = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v6m0 0c-2 0-3 1-4 3-1 2-2 4-2 6 0 2 1 3 2 3 2 0 3-2 4-4m0-8c2 0 3 1 4 3 1 2 2 4 2 6 0 2-1 3-2 3-2 0-3-2-4-4" />
  </svg>
)

const Female = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="5" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13v8m-3-3h6" />
  </svg>
)

const Stomach = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6c-1 1-2 3-2 5 0 3 1 6 3 8 1 1 2 2 3 2s2-1 3-2c2-2 3-5 3-8 0-2-1-4-2-5-1-2-3-3-5-3s-4 1-5 3z" />
  </svg>
)

const Bone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 3a3 3 0 013 3 a3 3 0 01-3 3h-1l-5 6h-1a3 3 0 01-3 3 a3 3 0 01-3-3 a3 3 0 013-3h1l5-6h1a3 3 0 013-3z" />
  </svg>
)

// Same SPECIALITIES array from your onboarding form
const SPECIALITIES = [
  { value: 'General Practice', icon: Heart, color: 'text-red-500' },
  { value: 'Family Medicine', icon: Users, color: 'text-blue-500' },
  { value: 'Internal Medicine', icon: Stethoscope, color: 'text-green-500' },
  { value: 'Pediatrics', icon: Baby, color: 'text-pink-500' },
  { value: 'Obstetrics & Gynecology', icon: Female, color: 'text-purple-500' },
  { value: 'Surgery', icon: Scissors, color: 'text-orange-500' },
  { value: 'Orthopedics', icon: Bone, color: 'text-gray-700' },
  { value: 'Cardiology', icon: Heart, color: 'text-red-600' },
  { value: 'Neurology', icon: Brain, color: 'text-indigo-600' },
  { value: 'Psychiatry', icon: Brain, color: 'text-purple-600' },
  { value: 'Dermatology', icon: Shield, color: 'text-yellow-600' },
  { value: 'Ophthalmology', icon: Eye, color: 'text-blue-600' },
  { value: 'ENT (Ear, Nose, Throat)', icon: Ear, color: 'text-teal-600' },
  { value: 'Dentistry', icon: Tooth, color: 'text-cyan-600' },
  { value: 'Urology', icon: Kidney, color: 'text-violet-600' },
  { value: 'Nephrology', icon: Kidney, color: 'text-violet-500' },
  { value: 'Endocrinology', icon: Activity, color: 'text-emerald-600' },
  { value: 'Gastroenterology', icon: Stomach, color: 'text-amber-600' },
  { value: 'Pulmonology', icon: Lung, color: 'text-sky-600' },
  { value: 'Rheumatology', icon: Bone, color: 'text-rose-600' },
  { value: 'Oncology', icon: Activity, color: 'text-red-700' },
  { value: 'Hematology', icon: TestTube, color: 'text-red-800' },
  { value: 'Infectious Diseases', icon: Thermometer, color: 'text-orange-600' },
  { value: 'Allergy & Immunology', icon: Syringe, color: 'text-blue-700' },
  { value: 'Pathology', icon: Microscope, color: 'text-gray-600' },
  { value: 'Radiology', icon: Cloud, color: 'text-slate-600' },
  { value: 'Anesthesiology', icon: Shield, color: 'text-indigo-500' },
  { value: 'Emergency Medicine', icon: AlertCircle, color: 'text-red-600' },
  { value: 'Physical Medicine & Rehabilitation', icon: Bone, color: 'text-green-700' },
  { value: 'Preventive Medicine', icon: Shield, color: 'text-teal-700' },
  { value: 'Sports Medicine', icon: Award, color: 'text-orange-700' },
  { value: 'Telemedicine', icon: Smartphone, color: 'text-blue-800' },
  { value: 'Alternative Medicine', icon: Leaf, color: 'text-green-800' },
  { value: 'Other', icon: Stethoscope, color: 'text-gray-500' },
]

export default function ResubmissionForm({ currentUser, onBack }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credentialFile, setCredentialFile] = useState(null)
  const [credentialPreview, setCredentialPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [selectedSpeciality, setSelectedSpeciality] = useState(currentUser.speciality || '')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, credential: 'Please upload an image file' })
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, JPEG)',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, credential: 'File size must be less than 5MB' })
      toast.error('File too large', {
        description: 'Please upload a file smaller than 5MB',
      })
      return
    }

    setCredentialFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setCredentialPreview(reader.result)
    }
    reader.readAsDataURL(file)

    setErrors({ ...errors, credential: '' })
    toast.success('Document uploaded successfully', {
      description: 'Your credential file is ready for submission',
    })
  }

  const removeFile = () => {
    setCredentialFile(null)
    setCredentialPreview(null)
    toast.info('Document removed', {
      description: 'You can upload a different file',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    // Validate required fields
    const requiredFields = ['speciality', 'experience', 'licenseNumber', 'phone', 'city', 'bio']
    const missingFields = []

    requiredFields.forEach(field => {
      if (!formData.get(field)) {
        missingFields.push(field)
      }
    })

    if (missingFields.length > 0) {
      toast.error('Missing information', {
        description: `Please fill in: ${missingFields.join(', ')}`,
      })
      setLoading(false)
      return
    }

    if (!credentialFile && !currentUser.credentialUrl) {
      toast.error('Document required', {
        description: 'Please upload your medical license or certificate',
      })
      setLoading(false)
      return
    }

    const experience = parseInt(formData.get('experience'), 10)
    if (experience < 1 || experience > 50) {
      toast.error('Invalid experience', {
        description: 'Experience must be between 1 and 50 years',
      })
      setLoading(false)
      return
    }

    try {
      // Convert image to base64 if new file uploaded
      if (credentialFile) {
        const base64 = await compressAndConvertToBase64(credentialFile)
        formData.set('credentialUrl', base64)
      } else {
        // Use existing credential URL if no new file uploaded
        formData.set('credentialUrl', currentUser.credentialUrl || '')
      }

      const result = await resubmitVerification(formData)

      if (result.success) {
        toast.success('Verification resubmitted', {
          description: 'Your updated credentials have been submitted for review. You will be notified once verified.',
          duration: 5000,
        })
        router.refresh() // Refresh the page to show updated status
      } else {
        toast.error('Resubmission failed', {
          description: result.error || 'Please try again',
        })
        setLoading(false)
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again or contact support',
      })
      console.error('Error submitting form:', error)
      setLoading(false)
    }
  }

  const compressAndConvertToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          let width = img.width
          let height = img.height
          const maxWidth = 1200

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)
          const base64 = canvas.toDataURL('image/jpeg', 0.7)
          resolve(base64)
        }
        img.onerror = reject
        img.src = e.target?.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const selectedSpecialityData = SPECIALITIES.find(s => s.value === selectedSpeciality)

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Update Your Information</h4>
            <p className="text-sm text-gray-600">
              Please review and update any incorrect information. Upload new documents if needed.
            </p>
          </div>

          {/* Speciality */}
          <div className="space-y-2">
            <Label htmlFor="speciality">Speciality *</Label>
            <Select 
              name="speciality" 
              required 
              onValueChange={setSelectedSpeciality}
              value={selectedSpeciality}
              defaultValue={currentUser.speciality}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your speciality" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALITIES.map((spec) => {
                  const Icon = spec.icon
                  return (
                    <SelectItem key={spec.value} value={spec.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${spec.color}`} />
                        <span>{spec.value}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {selectedSpecialityData && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-2">
                <div className={`p-2 rounded-md ${selectedSpecialityData.color.replace('text-', 'bg-')}/10`}>
                  <selectedSpecialityData.icon className={`h-5 w-5 ${selectedSpecialityData.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedSpecialityData.value}</p>
                  <p className="text-xs text-gray-500">Selected speciality</p>
                </div>
              </div>
            )}
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
              defaultValue={currentUser.experience || ''}
              placeholder="For example, 5"
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
              defaultValue={currentUser.licenseNumber || ''}
              placeholder="For example, KMP/12345"
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
              defaultValue={currentUser.phone || ''}
              placeholder="For example, +254712345678"
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
              defaultValue={currentUser.city || ''}
              placeholder="For example, Nairobi"
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
              defaultValue={currentUser.bio || ''}
              placeholder="Tell us about your medical background, expertise, and what patients can expect from your consultations"
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your public profile
            </p>
          </div>

          {/* Credential Upload */}
          <div className="space-y-2">
            <Label>Medical License or Certificate *</Label>
            <p className="text-sm text-gray-600 mb-2">
              {currentUser.credentialUrl 
                ? 'You have already uploaded a document. Upload a new one only if you need to update it.'
                : 'Please upload your medical license or certificate'
              }
            </p>
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
                      {currentUser.credentialUrl ? 'Upload new document' : 'Click to upload'}
                    </Label>
                    <Input
                      type="file"
                      id="credential"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
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

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Resubmission Process</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your updated information will be reviewed within 24-48 hours. Your verification status will be reset to "Pending" until the review is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resubmitting for verification
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resubmit Verification
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your updated information will be reviewed within 24-48 hours. You will receive an email once approved.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

