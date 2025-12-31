'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ban,
  Shield,
  Clock,
  RefreshCw,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { getAllDoctors } from '@/actions/admin'
import DoctorDetailsModal from './_components/DoctorDetailsModal'
import UpdateDoctorModal from './_components/UpdateDoctorModal'

// Status badge configuration
const getStatusConfig = (status, verificationStatus, doctorStatus) => {
  // First check doctor status (BANNED, SUSPENDED, DELETED)
  if (doctorStatus === 'BANNED') {
    return {
      label: 'Banned',
      variant: 'destructive',
      icon: Ban,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  }
  
  if (doctorStatus === 'SUSPENDED') {
    return {
      label: 'Suspended',
      variant: 'destructive',
      icon: AlertCircle,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  }
  
  if (doctorStatus === 'DELETED') {
    return {
      label: 'Deleted',
      variant: 'secondary',
      icon: Trash2,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  }
  
  // If active, check verification status
  if (verificationStatus === 'VERIFIED') {
    return {
      label: 'Verified',
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }
  
  if (verificationStatus === 'PENDING') {
    return {
      label: 'Pending',
      variant: 'outline',
      icon: Clock,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  }
  
  if (verificationStatus === 'REJECTED') {
    return {
      label: 'Rejected',
      variant: 'destructive',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  }
  
  return {
    label: 'Unknown',
    variant: 'secondary',
    icon: User,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
}

export default function DoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [modalType, setModalType] = useState(null) // 'view', 'update'

  // Fetch doctors
  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const filters = {}
      
      // Apply status filter
      if (statusFilter === 'verified') {
        filters.verificationStatus = 'VERIFIED'
        filters.doctorStatus = 'ACTIVE'
      } else if (statusFilter === 'pending') {
        filters.verificationStatus = 'PENDING'
        filters.doctorStatus = 'ACTIVE'
      } else if (statusFilter === 'rejected') {
        filters.verificationStatus = 'REJECTED'
        filters.doctorStatus = 'ACTIVE'
      } else if (statusFilter === 'suspended') {
        filters.doctorStatus = 'SUSPENDED'
      } else if (statusFilter === 'banned') {
        filters.doctorStatus = 'BANNED'
      } else if (statusFilter === 'deleted') {
        filters.doctorStatus = 'DELETED'
      }
      
      const result = await getAllDoctors(filters)
      
      if (result.success) {
        setDoctors(result.doctors)
      } else {
        toast.error('Failed to load doctors', {
          description: result.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load doctors'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter doctors based on search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors
    
    return doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.speciality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [doctors, searchQuery])

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: doctors.length,
      verified: 0,
      pending: 0,
      rejected: 0,
      suspended: 0,
      banned: 0,
      deleted: 0
    }
    
    doctors.forEach(doctor => {
      if (doctor.doctorStatus === 'ACTIVE') {
        if (doctor.verificationStatus === 'VERIFIED') counts.verified++
        if (doctor.verificationStatus === 'PENDING') counts.pending++
        if (doctor.verificationStatus === 'REJECTED') counts.rejected++
      } else {
        counts[doctor.doctorStatus.toLowerCase()]++
      }
    })
    
    return counts
  }, [doctors])

  // Handle action dropdown items
  const getActionItems = (doctor) => {
    const items = []
    
    // Always show View Details
    items.push({
      label: 'View Details',
      icon: Eye,
      onClick: () => {
        setSelectedDoctor(doctor)
        setModalType('view')
      }
    })
    
    // Edit profile (only for active doctors)
    if (doctor.doctorStatus === 'ACTIVE') {
      items.push({
        label: 'Edit Profile',
        icon: Edit,
        onClick: () => {
          setSelectedDoctor(doctor)
          setModalType('update')
        }
      })
    }
    
    // Add separator before status actions
    if (items.length > 0) {
      items.push('separator')
    }
    
    // Status-specific actions
    if (doctor.doctorStatus === 'ACTIVE') {
      if (doctor.verificationStatus === 'PENDING') {
        items.push({
          label: 'Verify Doctor',
          icon: CheckCircle,
          onClick: () => handleVerify(doctor.id, doctor.name)
        })
        items.push({
          label: 'Reject Verification',
          icon: XCircle,
          onClick: () => handleReject(doctor.id, doctor.name)
        })
      }
      
      items.push({
        label: 'Suspend Account',
        icon: AlertCircle,
        onClick: () => handleSuspend(doctor.id, doctor.name)
      })
      
      items.push({
        label: 'Ban Account',
        icon: Ban,
        onClick: () => handleBan(doctor.id, doctor.name)
      })
    } else if (doctor.doctorStatus === 'SUSPENDED') {
      items.push({
        label: 'Unsuspend Account',
        icon: RefreshCw,
        onClick: () => handleUnsuspend(doctor.id, doctor.name)
      })
    } else if (doctor.doctorStatus === 'BANNED') {
      items.push({
        label: 'Unban Account',
        icon: Shield,
        onClick: () => handleUnban(doctor.id, doctor.name)
      })
    } else if (doctor.doctorStatus === 'DELETED') {
      items.push({
        label: 'Restore Account',
        icon: RefreshCw,
        onClick: () => handleRestore(doctor.id, doctor.name)
      })
    }
    
    // Add delete (soft delete) for non-deleted doctors
    if (doctor.doctorStatus !== 'DELETED') {
      items.push('separator')
      items.push({
        label: 'Delete Account',
        icon: Trash2,
        destructive: true,
        onClick: () => handleDelete(doctor.id, doctor.name)
      })
    }
    
    return items
  }

  // Action handlers
  const handleVerify = async (doctorId, doctorName) => {
    const result = await verifyDoctor(doctorId, 'Verification approved by admin')
    if (result.success) {
      toast.success('Doctor Verified', { description: `${doctorName} has been verified.` })
      fetchDoctors()
    } else {
      toast.error('Verification Failed', { description: result.error })
    }
  }

  const handleReject = async (doctorId, doctorName) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    
    const result = await rejectDoctor(doctorId, reason)
    if (result.success) {
      toast.success('Doctor Rejected', { description: `${doctorName} has been rejected.` })
      fetchDoctors()
    } else {
      toast.error('Rejection Failed', { description: result.error })
    }
  }

  const handleSuspend = async (doctorId, doctorName) => {
    const reason = prompt('Please provide a reason for suspension:')
    if (!reason) return
    
    const days = prompt('Suspension duration (days):', '7')
    if (!days) return
    
    const result = await suspendDoctor(doctorId, reason, parseInt(days))
    if (result.success) {
      toast.success('Doctor Suspended', { description: `${doctorName} has been suspended.` })
      fetchDoctors()
    } else {
      toast.error('Suspension Failed', { description: result.error })
    }
  }

  const handleUnsuspend = async (doctorId, doctorName) => {
    const result = await unsuspendDoctor(doctorId)
    if (result.success) {
      toast.success('Doctor Unsuspended', { description: `${doctorName} has been unsuspended.` })
      fetchDoctors()
    } else {
      toast.error('Unsuspension Failed', { description: result.error })
    }
  }

  const handleBan = async (doctorId, doctorName) => {
    const reason = prompt('Please provide a reason for ban:')
    if (!reason) return
    
    const result = await banDoctor(doctorId, reason)
    if (result.success) {
      toast.success('Doctor Banned', { description: `${doctorName} has been banned.` })
      fetchDoctors()
    } else {
      toast.error('Ban Failed', { description: result.error })
    }
  }

  const handleUnban = async (doctorId, doctorName) => {
    const result = await unbanDoctor(doctorId)
    if (result.success) {
      toast.success('Doctor Unbanned', { description: `${doctorName} has been unbanned.` })
      fetchDoctors()
    } else {
      toast.error('Unban Failed', { description: result.error })
    }
  }

  const handleDelete = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to delete ${doctorName}? This can be undone later.`)) return
    
    const result = await deleteDoctor(doctorId)
    if (result.success) {
      toast.success('Doctor Deleted', { description: `${doctorName} has been soft deleted.` })
      fetchDoctors()
    } else {
      toast.error('Delete Failed', { description: result.error })
    }
  }

  const handleRestore = async (doctorId, doctorName) => {
    const result = await restoreDoctor(doctorId)
    if (result.success) {
      toast.success('Doctor Restored', { description: `${doctorName} has been restored.` })
      fetchDoctors()
    } else {
      toast.error('Restore Failed', { description: result.error })
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
     

      {/* Search and Filters */}
      <Card>
        <CardHeader className="">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search doctors by name, email, speciality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchDoctors}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Status Tabs */}
          <Tabs defaultValue="all" onValueChange={setStatusFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                  {statusCounts.verified}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                  {statusCounts.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-600">
                  {statusCounts.rejected}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="suspended">
                Suspended
                <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700">
                  {statusCounts.suspended}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="banned">
                Banned
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                  {statusCounts.banned}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="deleted">
                Deleted
                <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-700">
                  {statusCounts.deleted}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
            </TabsContent>
          </Tabs>

          {/* Doctors Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Speciality</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No doctors found matching your search' : 'No doctors found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => {
                    const statusConfig = getStatusConfig(
                      doctor.doctorStatus,
                      doctor.verificationStatus,
                      doctor.doctorStatus
                    )
                    const Icon = statusConfig.icon
                    const actionItems = getActionItems(doctor)
                    
                    return (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
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
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {doctor.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {doctor.speciality || 'Not specified'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor.experience ? `${doctor.experience} years` : 'Not specified'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig.variant}
                            className={`${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor} flex items-center gap-1 w-fit`}
                          >
                            <Icon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(doctor.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{doctor.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500">({doctor.totalReviews || 0})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDoctor(doctor)
                                setModalType('view')
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actionItems.map((item, index) => {
                                  if (item === 'separator') {
                                    return <DropdownMenuSeparator key={`separator-${index}`} />
                                  }
                                  
                                  const Icon = item.icon
                                  return (
                                    <DropdownMenuItem
                                      key={item.label}
                                      onClick={item.onClick}
                                      className={item.destructive ? 'text-red-600' : ''}
                                    >
                                      <Icon className="h-4 w-4 mr-2" />
                                      {item.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination can be added here if needed */}
          {!loading && filteredDoctors.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
              {/* Add pagination component here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedDoctor && modalType === 'view' && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          isOpen={modalType === 'view'}
          onClose={() => {
            setSelectedDoctor(null)
            setModalType(null)
          }}
          onUpdate={() => {
            setModalType('update')
          }}
          onRefresh={fetchDoctors}
        />
      )}

      {selectedDoctor && modalType === 'update' && (
        <UpdateDoctorModal
          doctor={selectedDoctor}
          isOpen={modalType === 'update'}
          onClose={() => {
            setSelectedDoctor(null)
            setModalType(null)
          }}
          onSuccess={() => {
            setSelectedDoctor(null)
            setModalType(null)
            fetchDoctors()
            toast.success('Profile Updated', {
              description: 'Doctor profile has been updated successfully.'
            })
          }}
        />
      )}
    </div>
  )
}

