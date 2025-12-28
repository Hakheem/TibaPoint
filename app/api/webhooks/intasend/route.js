// app/api/webhooks/intasend/route.js - FIXED
import { NextResponse } from 'next/server'
import { processSuccessfulPayment } from '@/actions/checkout'

export async function POST(req) {
  console.log('📩 IntaSend webhook received! Time:', new Date().toISOString())
  
  try {
    const body = await req.json()
    console.log('📦 Full webhook body:', body) // Log everything
    
    // Check all possible places for metadata
    let metadata = body.metadata
    
    // If no metadata field, check if it's in the body directly
    if (!metadata) {
      console.log('⚠️ No metadata field found, checking body structure:', Object.keys(body))
      
      // Try to find user/package data in other fields
      metadata = JSON.stringify({
        // Check if IntaSend puts data in different fields
        invoice_id: body.invoice_id,
        api_ref: body.api_ref,
        customer: body.customer,
        payment_method: body.payment_method,
        // Include everything that might be useful
        ...body
      })
    }
    
    const { invoice_id, api_ref, state } = body
    
    console.log('📊 Parsed data:', { 
      invoice_id: invoice_id?.substring(0, 10) + '...', 
      api_ref, 
      state,
      hasMetadata: !!metadata 
    })
    
    if (state === 'COMPLETE' || state === 'COMPLETED') {
      console.log('✅ Processing successful payment...')
      
      try {
        // Pass metadata even if it's empty/null
        const result = await processSuccessfulPayment({
          invoice_id,
          api_ref,
          metadata: metadata || '{}' // Send empty object if no metadata
        })
        
        console.log('💾 Result:', result)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Payment processed'
        })
      } catch (paymentError) {
        console.error('❌ Payment processing failed:', paymentError.message)
        return NextResponse.json(
          { 
            error: 'Payment processing failed', 
            details: paymentError.message 
          }, 
          { status: 500 }
        )
      }
    }
    
    console.log(`ℹ️ Payment state: ${state}`)
    
    return NextResponse.json({ 
      received: true, 
      state: state 
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error.message)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('✅ GET request to webhook endpoint')
  return NextResponse.json({ 
    status: 'active',
    message: 'IntaSend webhook endpoint is working'
  })
}
