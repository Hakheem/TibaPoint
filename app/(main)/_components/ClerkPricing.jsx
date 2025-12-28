import { Card, CardContent } from '@/components/ui/card'
import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const ClerkPricing = () => {
  return (
    <div>
<Card>
<CardContent>
    <PricingTable />
    </CardContent>
    </Card>

    </div>
  )
} 

export default ClerkPricing