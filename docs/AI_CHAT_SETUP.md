# AI Chat Feature Setup

## Overview

The AI Chat feature allows administrators and managers to chat with visitors and answer questions automatically. It includes:

- **Smart Responses**: Rule-based responses for common questions
- **OpenAI Integration**: Optional GPT-3.5-turbo integration for advanced AI responses
- **Beautiful UI**: Modern chat interface with message history
- **Real-time**: Instant responses to user queries

## Features

### Current Capabilities

The AI can answer questions about:

- ✅ Properties and units (availability, pricing, features)
- ✅ Maintenance requests (how to submit, emergency procedures)
- ✅ Notices and announcements
- ✅ Rent payments and billing
- ✅ Office hours and contact information
- ✅ Move-in/move-out procedures
- ✅ General property management questions

### UI Features

- Modern chat interface with message bubbles
- User and AI message differentiation
- Loading indicators
- Auto-scroll to latest message
- Keyboard shortcuts (Enter to send)
- Responsive design (mobile-friendly)

## Setup

### Basic Setup (Rule-Based Only)

The chat works out of the box with rule-based responses. No additional setup needed!

### Optional: OpenAI Integration

For more advanced AI responses, you can integrate OpenAI:

1. **Get OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Create an API key in your dashboard

2. **Add to Environment Variables**

   ```bash
   # Add to .env file
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Restart Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### How It Works

1. **Without OpenAI API Key**:
   - Uses intelligent rule-based responses
   - Matches keywords and patterns
   - Provides helpful, contextual answers

2. **With OpenAI API Key**:
   - Uses GPT-3.5-turbo for natural language understanding
   - Maintains conversation context
   - Falls back to rule-based if API fails

## Usage

### Accessing Chat

1. Log in as ADMIN or MANAGER
2. Click "Chat with Visitors" in the sidebar
3. Start chatting!

### Example Questions

Try asking:

- "What properties are available?"
- "How do I submit a maintenance request?"
- "What are your office hours?"
- "How do I pay rent?"
- "Tell me about amenities"

## Customization

### Adding Custom Responses

Edit `/src/app/api/chat/route.ts` and add new rules in the `getRuleBasedResponse` function:

```typescript
// Example: Add parking questions
if (lowerMessage.includes('parking')) {
  return 'We offer both covered and uncovered parking options. Please contact management for availability and pricing.'
}
```

### Changing AI Model

In `/src/app/api/chat/route.ts`, change the model:

```typescript
model: 'gpt-4', // or 'gpt-3.5-turbo', 'gpt-4-turbo', etc.
```

### Customizing System Prompt

Modify the `systemPrompt` in the API route to change the AI's behavior and knowledge base.

## API Endpoint

**POST** `/api/chat`

**Request:**

```json
{
  "message": "What properties are available?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**

```json
{
  "response": "To check available properties..."
}
```

## Security

- ✅ Requires authentication (ADMIN/MANAGER only)
- ✅ API key stored securely in environment variables
- ✅ Rate limiting recommended for production
- ✅ Input validation and sanitization

## Future Enhancements

Potential improvements:

- [ ] Chat history storage in database
- [ ] Multiple conversation threads
- [ ] File attachments
- [ ] Voice input/output
- [ ] Integration with property data
- [ ] Analytics and insights
- [ ] Custom training on property data

## Troubleshooting

### Chat not responding

- Check browser console for errors
- Verify API route is accessible: `/api/chat`
- Check server logs for errors

### OpenAI not working

- Verify `OPENAI_API_KEY` is set correctly
- Check API key is valid and has credits
- Check server logs for API errors
- System will fall back to rule-based responses

### Messages not appearing

- Check network tab in browser DevTools
- Verify authentication is working
- Check user role is ADMIN or MANAGER

## Cost Considerations

### Rule-Based (Free)

- No API costs
- Instant responses
- Limited to predefined patterns

### OpenAI Integration

- Pay-per-use pricing
- ~$0.002 per 1K tokens (GPT-3.5-turbo)
- More natural conversations
- Better understanding of context

**Estimated costs**: ~$0.01-0.05 per conversation (depending on length)

## Support

For issues or questions:

1. Check server logs
2. Review API responses in browser DevTools
3. Test with simple questions first
4. Verify environment variables are set correctly
