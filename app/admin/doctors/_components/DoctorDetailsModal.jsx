'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Calendar,
  Star,
  FileText,
  Shield,
  AlertCircle,
  Ban,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Download,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { getDoctorDetails } from '@/actions/admin'

const DoctorDetailsModal = ({ doctor, isOpen, onClose, onUpdate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [doctorDetails, setDoctorDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load doctor details when modal opens
  const loadDetails = async () => {
    if (!doctorDetails && isOpen) {
      try {
        setLoading(true)
        const result = await getDoctorDetails(doctor.id)
        if (result.success) {
          setDoctorDetails(result.doctor)
        }
      } catch (error) {
        toast.error('Failed to load details')
      } finally {
        setLoading(false)
      }
    }
  }

  // Status configuration
  const getStatusConfig = () => {
    if (doctor.doctorStatus === 'BANNED') {
      return {
        label: 'Banned',
        icon: Ban,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'This doctor has been permanently banned.'
      }
    }
    
    if (doctor.doctorStatus === 'SUSPENDED') {
      return {
        label: 'Suspended',
        icon: AlertCircle,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: 'This doctor account is temporarily suspended.'
      }
    }
    
    if (doctor.doctorStatus === 'DELETED') {
      return {
        label: 'Deleted',
        icon: XCircle,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        description: 'This doctor account has been soft deleted.'
      }
    }
    
    if (doctor.verificationStatus === 'VERIFIED') {
      return {
        label: 'Verified',
        icon: CheckCircle,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'This doctor is verified and active.'
      }
    }
    
    if (doctor.verificationStatus === 'PENDING') {
      return {
        label: 'Pending Verification',
        icon: Clock,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Awaiting verification review.'
      }
    }
    
    if (doctor.verificationStatus === 'REJECTED') {
      return {
        label: 'Rejected',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Verification was rejected.'
      }
    }
    
    return {
      label: 'Unknown',
      icon: User,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Status unknown'
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Section with Gradient */}
        <div className=" border-b px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Profile Image */}
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-primary shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
                  {doctor.imageUrl ? (
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-blue-600" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 flex items-center justify-center shadow-sm`}>
                  <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold  mb-1">
                  {doctor.name}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground mb-3">
                  {doctor.speciality || 'General Practitioner'}
                </DialogDescription>
                
                {/* Quick Stats Pills */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 rounded-full text-sm shadow-sm">
                    <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                    <span className="font-medium text-gray-700">{doctor.experience || 0} years</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 rounded-full text-sm shadow-sm">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-gray-700">{doctor.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                 
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-2 ${statusConfig.borderColor} px-4 py-2 flex items-center gap-2 text-sm font-semibold shadow-sm`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 gap-2 w-full bg-gray-100/80 dark:bg-gray-950/80 p-1 h-auto">
              <TabsTrigger value="overview" className="cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm py-2.5">
                <User className="h-4 w-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="credentials" className="cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm py-2.5">
                <Shield className="h-4 w-4 mr-1" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="performance" className="cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm py-2.5">
                <TrendingUp className="h-4 w-4 mr-1" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="activity" className="cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm py-2.5">
                <Activity className="h-4 w-4 mr-1" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-700 mb-0.5">Email</p>
                      <p className="font-semibold text-gray-900 truncate text-sm">{doctor.email}</p>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700 mb-0.5">Phone</p>
                      <p className="font-semibold text-gray-900 text-sm">{doctor.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-purple-700 mb-0.5">Location</p>
                      <p className="font-semibold text-gray-900 text-sm">{doctor.city || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Professional Details
                  </h3>
                  <div className="bg-card border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-sm text-gray-600">Specialization</span>
                      <span className="font-semibold text-gray-900">{doctor.speciality || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-sm text-gray-600">Experience</span>
                      <span className="font-semibold text-gray-900">{doctor.experience || 0} years</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-sm text-gray-600">License Number</span>
                      <span className="font-semibold text-gray-900 font-mono">{doctor.licenseNumber || 'N/A'}</span>
                    </div>
                  
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold  flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financial Details
                  </h3>
                  <div className="bg-card border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-sm text-gray-600">Consultation Fee</span>
                      <span className="font-semibold text-gray-900">{doctor.consultationFee || 2} credits</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-sm text-gray-600">Credit Balance</span>
                      <span className="font-semibold text-gray-900">{doctor.creditBalance || 0} credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-semibold text-gray-900">{formatCurrency((doctor.creditBalance || 0) * 100)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {doctor.bio && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold  flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Professional Biography
                  </h3>
                  <div className=" p-5">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{doctor.bio}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-6 mt-6">
              {/* Verification Status Banner */}
              <div className={`p-5 rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${statusConfig.color} bg-card shadow-sm`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{statusConfig.label}</h4>
                    <p className="text-sm text-gray-600">{statusConfig.description}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  License Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl">
                    <p className="text-sm font-medium text-blue-700 mb-2">License Number</p>
                    <p className="font-bold text-2xl text-gray-900 font-mono">{doctor.licenseNumber || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5 rounded-xl">
                    <p className="text-sm font-medium text-green-700 mb-2">Consultation Fee</p>
                    <p className="font-bold text-2xl text-gray-900">{doctor.consultationFee || 2} credits</p>
                  </div>
                </div>
              </div>

              {/* Credential Document */}
              {doctor.credentialUrl && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Medical License Certificate</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 rounded-lg overflow-hidden shadow-lg bg-white p-2">
                        <img
                          src={doctor.credentialUrl}
                          alt="Medical credential"
                          className="max-h-96 max-w-full rounded object-contain"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="shadow-sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                        <Button variant="outline" size="sm" className="shadow-sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              {doctorDetails ? (
                <>
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {doctorDetails.stats?.completionRate?.toFixed(1) || 0}%
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Avg Rating</p>
                      <p className="text-3xl font-bold text-gray-900">{doctor.averageRating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Total Reviews</p>
                      <p className="text-3xl font-bold text-gray-900">{doctor.totalReviews || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-1">Credits</p>
                      <p className="text-3xl font-bold text-gray-900">{doctor.creditBalance || 0}</p>
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {doctorDetails.reviewsReceived && doctorDetails.reviewsReceived.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-600" />
                        Recent Reviews
                      </h3>
                      <div className="space-y-3">
                        {doctorDetails.reviewsReceived.slice(0, 5).map((review) => (
                          <div key={review.id} className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'text-amber-500 fill-amber-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-gray-900">{review.rating}.0</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                            )}
                            {review.patient && (
                              <p className="text-sm font-medium text-gray-600">
                                — {review.patient.name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Appointments */}
                  {doctorDetails.appointmentsAsDoctor && doctorDetails.appointmentsAsDoctor.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Recent Appointments
                      </h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                              <th className="p-4 text-left text-sm font-semibold text-gray-700">Credits</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {doctorDetails.appointmentsAsDoctor.slice(0, 5).map((appointment) => (
                              <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{appointment.patient?.name}</p>
                                      <p className="text-sm text-gray-500">{appointment.patient?.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-sm text-gray-700">
                                  {formatDate(appointment.startTime)}
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant={
                                      appointment.status === 'COMPLETED' ? 'default' :
                                      appointment.status === 'CANCELLED' ? 'destructive' :
                                      appointment.status === 'NO_SHOW' ? 'destructive' :
                                      'outline'
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-gray-900">{appointment.creditsCharged} credits</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading performance data...</p>
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Activity logs will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onUpdate}
              className="flex items-center gap-2 shadow-sm hover:shadow"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={loadDetails}
              disabled={loading}
              className="shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <Button onClick={onClose} className="shadow-sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DoctorDetailsModal
