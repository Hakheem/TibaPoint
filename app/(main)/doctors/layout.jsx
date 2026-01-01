import { Stethoscope } from 'lucide-react'

export const metadata = {
  title: {
    default: 'Find Doctors - Online Medical Consultations',
    template: '%s | MediPass'
  },
  description: 'Connect with certified medical professionals for online consultations. Browse doctors by specialty and book appointments for expert medical advice from the comfort of your home.',
  keywords: [
    'online doctor consultation',
    'telemedicine',
    'medical specialists',
    'virtual healthcare',
    'book doctor appointment',
    'online medical advice',
    'certified doctors',
    'healthcare professionals'
  ],
  openGraph: {
    title: 'Find Doctors - Online Medical Consultations',
    description: 'Connect with certified medical professionals for online consultations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Doctors - Online Medical Consultations',
    description: 'Connect with certified medical professionals for online consultations.',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function DoctorsLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}