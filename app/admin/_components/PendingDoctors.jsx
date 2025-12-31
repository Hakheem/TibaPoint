'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Eye, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyDoctor, rejectDoctor } from '@/actions/admin'
import { toast } from 'sonner'
import VerificationModal from './VerificationModal' // Add this import

const PendingDoctors = ({ doctors = [] }) => {
  const [loading, setLoading] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  const handleVerifyClick = (doctor) => {
    setSelectedDoctor(doctor)
    setModalOpen(true)
  }

  const handleConfirmVerification = async (notes) => {
    if (!selectedDoctor) return

    setLoading(prev => ({ ...prev, [selectedDoctor.id]: 'verify' }))
    setModalOpen(false)
    
    const result = await verifyDoctor(selectedDoctor.id, notes)
    
    if (result.success) {
      toast.success('Doctor Verified', {
        description: `${selectedDoctor.name} has been verified successfully.`,
      })
    } else {
      toast.error('Verification Failed', {
        description: result.error || 'Failed to verify doctor.',
      })
    }
    
    setLoading(prev => ({ ...prev, [selectedDoctor.id]: null }))
    setSelectedDoctor(null)
  }

  const handleReject = async (doctorId, doctorName) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    setLoading(prev => ({ ...prev, [doctorId]: 'reject' }))
    
    const result = await rejectDoctor(doctorId, reason)
    
    if (result.success) {
      toast.success('Doctor Rejected', {
        description: `${doctorName} has been rejected.`,
      })
    } else {
      toast.error('Rejection Failed', {
        description: result.error || 'Failed to reject doctor.',
      })
    }
    
    setLoading(prev => ({ ...prev, [doctorId]: null }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (doctors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Doctors
          </CardTitle>
          <CardDescription>
            Doctors awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No pending doctors at the moment.</p>
            <p className="text-sm text-gray-400 mt-1">All doctors have been reviewed.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Doctors
            <span className="ml-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
              {doctors.length}
            </span>
          </CardTitle>
          <CardDescription>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {doctor.imageUrl ? (
                      <img
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{doctor.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{doctor.speciality || 'No speciality'}</span>
                      <span className="mx-2">•</span>
                      <span>{doctor.licenseNumber || 'No license'}</span>
                      <span className="mx-2">•</span>
                      <span>Applied {formatDate(doctor.createdAt)}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                        {doctor.experience || 0} years experience
                      </div>
                      {doctor.city && (
                        <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded ml-2">
                          {doctor.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/doctors/${doctor.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerifyClick(doctor)}
                    disabled={loading[doctor.id] === 'verify'}
                  >
                    {loading[doctor.id] === 'verify' ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(doctor.id, doctor.name)}
                    disabled={loading[doctor.id] === 'reject'}
                  >
                    {loading[doctor.id] === 'reject' ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {doctors.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link href="/admin/doctors/pending">
                    View All Pending Doctors
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedDoctor(null)
        }}
        doctor={selectedDoctor}
        onConfirm={handleConfirmVerification}
        isVerifying={selectedDoctor ? loading[selectedDoctor.id] === 'verify' : false}
      />
    </>
  )
}

export default PendingDoctors


