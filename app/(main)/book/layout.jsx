'use client'

const BookingLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/30 dark:via-primary/10 dark:to-transparent">
      {children}
    </div>
  )
}

export default BookingLayout