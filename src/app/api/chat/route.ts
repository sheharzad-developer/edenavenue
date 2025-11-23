import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Simple rule-based responses for common questions
// Can be enhanced with OpenAI API if OPENAI_API_KEY is set
function getRuleBasedResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! I'm the Eden Avenue AI assistant. How can I help you today?"
  }

  // Property questions
  if (
    lowerMessage.includes('property') ||
    lowerMessage.includes('unit') ||
    lowerMessage.includes('apartment')
  ) {
    if (lowerMessage.includes('available') || lowerMessage.includes('vacant')) {
      return 'To check available properties and units, please visit our properties page or contact our management office. I can help you understand our property features and amenities.'
    }
    if (
      lowerMessage.includes('rent') ||
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost')
    ) {
      return 'Rental prices vary by unit size and location. Please contact our management office for current pricing and availability. We offer competitive rates and flexible lease terms.'
    }
    return 'Our properties feature modern amenities, secure access, and professional management. Would you like to know about specific features, availability, or pricing?'
  }

  // Maintenance requests
  if (
    lowerMessage.includes('maintenance') ||
    lowerMessage.includes('repair') ||
    lowerMessage.includes('fix') ||
    lowerMessage.includes('broken')
  ) {
    return 'For maintenance requests, you can submit them through your resident portal or contact our maintenance team directly. Emergency maintenance issues are handled 24/7. Would you like help submitting a maintenance request?'
  }

  // Notices/Announcements
  if (
    lowerMessage.includes('notice') ||
    lowerMessage.includes('announcement') ||
    lowerMessage.includes('news') ||
    lowerMessage.includes('update')
  ) {
    return 'You can view all notices and announcements in your resident portal. Important updates about building maintenance, events, and policies are posted there regularly.'
  }

  // Payment/Rent
  if (
    lowerMessage.includes('payment') ||
    lowerMessage.includes('rent') ||
    lowerMessage.includes('bill') ||
    lowerMessage.includes('due')
  ) {
    return 'Rent payments can be made through the resident portal, by check, or through our online payment system. Payment due dates and methods are outlined in your lease agreement. For payment questions, please contact our office.'
  }

  // Contact information
  if (
    lowerMessage.includes('contact') ||
    lowerMessage.includes('phone') ||
    lowerMessage.includes('email') ||
    lowerMessage.includes('office')
  ) {
    return 'You can reach our management office through the contact information provided in your resident portal, or submit a request through the system. Our office hours are typically Monday-Friday, 9 AM - 5 PM.'
  }

  // Hours/Office hours
  if (
    lowerMessage.includes('hour') ||
    lowerMessage.includes('open') ||
    lowerMessage.includes('close')
  ) {
    return 'Our management office is typically open Monday through Friday, 9:00 AM to 5:00 PM. For emergencies, we have 24/7 support available.'
  }

  // Amenities
  if (
    lowerMessage.includes('amenity') ||
    lowerMessage.includes('facility') ||
    lowerMessage.includes('gym') ||
    lowerMessage.includes('pool') ||
    lowerMessage.includes('parking')
  ) {
    return "Our properties offer various amenities depending on the location. Common amenities include parking, laundry facilities, and secure access. Please check your property's specific amenities in the resident portal or contact management."
  }

  // Move-in/Move-out
  if (
    lowerMessage.includes('move in') ||
    lowerMessage.includes('move out') ||
    lowerMessage.includes('moving')
  ) {
    return "For move-in or move-out procedures, please contact our management office at least 30 days in advance. We'll provide you with all necessary forms and scheduling information."
  }

  // General help
  if (
    lowerMessage.includes('help') ||
    lowerMessage.includes('support') ||
    lowerMessage.includes('assist')
  ) {
    return "I'm here to help! I can answer questions about properties, maintenance requests, notices, payments, and more. What specific information do you need?"
  }

  return null
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can use chat
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { message, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Try OpenAI API if configured
    const openAiApiKey = process.env.OPENAI_API_KEY
    if (openAiApiKey) {
      try {
        const systemPrompt = `You are a helpful AI assistant for Eden Avenue Property Management. 
You help answer questions about:
- Properties and units
- Maintenance requests
- Notices and announcements
- Rent payments
- Office hours and contact information
- Move-in/move-out procedures
- General property management questions

Be friendly, professional, and concise. If you don't know something, direct users to contact the management office.`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(conversationHistory || []).slice(-10), // Last 10 messages for context
              { role: 'user', content: message },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const aiResponse = data.choices?.[0]?.message?.content
          if (aiResponse) {
            return NextResponse.json({ response: aiResponse })
          }
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
        // Fall through to rule-based response
      }
    }

    // Fallback to rule-based responses
    const ruleBasedResponse = getRuleBasedResponse(message)
    if (ruleBasedResponse) {
      return NextResponse.json({ response: ruleBasedResponse })
    }

    // Default response if no rule matches
    return NextResponse.json({
      response:
        'I understand you\'re asking about: "' +
        message +
        '". For specific information, please contact our management office or check your resident portal. Is there anything else I can help you with?',
    })
  } catch (error) {
    console.error('Error processing chat message:', error)
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
