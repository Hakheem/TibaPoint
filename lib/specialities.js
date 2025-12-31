import React from 'react'
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
  AlertCircle,
} from 'lucide-react'

// Custom SVG Components
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

// Specialties data
export const SPECIALITIES = [
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

// Export individual SVG components if needed elsewhere
export { 
  Tooth, 
  Ear, 
  Skull, 
  Kidney, 
  Lung, 
  Female, 
  Stomach, 
  Bone 
}

// Helper function to get specialty by value
export const getSpecialtyByValue = (value) => {
  return SPECIALITIES.find(specialty => specialty.value === value) || SPECIALITIES.find(specialty => specialty.value === 'Other')
}

// Helper function to get all specialty values for Select components
export const getSpecialtyValues = () => {
  return SPECIALITIES.map(specialty => specialty.value)
}

// Helper function to get icon component by specialty value
export const getSpecialtyIcon = (value) => {
  const specialty = getSpecialtyByValue(value)
  return specialty ? specialty.icon : Stethoscope
}

// Helper function to get color by specialty value
export const getSpecialtyColor = (value) => {
  const specialty = getSpecialtyByValue(value)
  return specialty ? specialty.color : 'text-gray-500'
}

// Helper function to generate slug from specialty value
export const generateSpecialtySlug = (specialtyValue) => {
  return specialtyValue
    .toLowerCase()
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/&/g, 'and') // Replace & with 'and'
    .replace(/[\s/]+/g, '-') // Replace spaces and slashes with hyphens
    .replace(/[^a-z0-9-]+/g, '') // Remove any remaining non-alphanumeric characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to convert slug back to display name
export const slugToDisplayName = (slug) => {
  if (!slug || typeof slug !== 'string') return ''
  
  // First, try to find exact match with generated slugs
  const specialty = SPECIALITIES.find(s => 
    generateSpecialtySlug(s.value) === slug
  )
  
  if (specialty) return specialty.value
  
  // If not found, try to reconstruct from slug
  const displayName = slug
    .split('-')
    .map(word => {
      // Handle special cases
      if (word === 'and') return '&'
      if (word === 'ent') return 'ENT'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
  
  // Try to find with reconstructed name
  const specialty2 = SPECIALITIES.find(s => 
    s.value.toLowerCase() === displayName.toLowerCase() ||
    generateSpecialtySlug(s.value).toLowerCase() === slug.toLowerCase()
  )
  
  return specialty2 ? specialty2.value : displayName
}