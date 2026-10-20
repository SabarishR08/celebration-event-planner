import OpenAI from 'openai';

/**
 * NVIDIA AI client using OpenAI-compatible API.
 * Uses meta/llama-3.2-11b-vision-instruct for intelligent event planning assistance.
 */
function getAIClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || '',
    baseURL: process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1',
  });
}

const AI_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

/**
 * System prompt for the event planning assistant.
 */
const SYSTEM_PROMPT = `You are CelebPlan AI, an expert celebration and event planning assistant. You help users organize weddings, birthdays, anniversaries, community events, and corporate events.

Your capabilities include:
1. **Event Planning**: Create comprehensive event plans with timelines, checklists, and milestones
2. **Budget Management**: Suggest budget breakdowns, track expenses, and recommend cost-saving strategies
3. **Vendor Recommendations**: Suggest vendor categories, provide checklists for vendor selection
4. **Guest Management**: Help with guest list organization, seating arrangements, RSVP tracking
5. **Theme & Decoration Ideas**: Provide creative theme suggestions, color palettes, and decoration ideas
6. **Timeline Creation**: Build detailed day-of timelines and planning timelines
7. **Cultural Considerations**: Account for cultural traditions, dietary requirements, and accessibility needs

Guidelines:
- Always be enthusiastic and supportive about the user's celebration plans
- Provide specific, actionable advice with concrete examples
- Consider budget constraints and suggest alternatives at different price points
- Ask clarifying questions when needed to provide better recommendations
- Format responses with clear headings, bullet points, and organized sections
- When suggesting budgets, use realistic price ranges
- Always consider accessibility and inclusivity in your suggestions
- Provide seasonal and location-specific advice when relevant

When the user provides event details, structure your response with:
- A brief summary of understanding
- Specific recommendations organized by category
- Action items or next steps
- Any important considerations or tips`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generates an AI response for event planning queries.
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  eventContext?: string
): Promise<string> {
  try {
    const systemMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (eventContext) {
      systemMessages.push({
        role: 'system',
        content: `Current event context:\n${eventContext}`,
      });
    }

    const aiClient = getAIClient();
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [...systemMessages, ...messages],
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
  } catch (error) {
    console.error('AI response generation error:', error);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
}

/**
 * Generates a structured event plan based on event details.
 */
export async function generateEventPlan(eventDetails: {
  type: string;
  budget: number;
  guestCount: number;
  date?: string;
  location?: string;
  theme?: string;
  notes?: string;
}): Promise<string> {
  const prompt = `Please create a comprehensive event plan for the following celebration:

**Event Type**: ${eventDetails.type}
**Budget**: $${eventDetails.budget.toLocaleString()}
**Expected Guests**: ${eventDetails.guestCount}
${eventDetails.date ? `**Date**: ${eventDetails.date}` : ''}
${eventDetails.location ? `**Location**: ${eventDetails.location}` : ''}
${eventDetails.theme ? `**Theme**: ${eventDetails.theme}` : ''}
${eventDetails.notes ? `**Additional Notes**: ${eventDetails.notes}` : ''}

Please provide:
1. A detailed budget breakdown with categories and estimated costs
2. A planning timeline with key milestones (working backward from the event date)
3. A vendor checklist with recommended vendor categories
4. Theme and decoration suggestions
5. A day-of timeline
6. Important tips and considerations`;

  return generateAIResponse([{ role: 'user', content: prompt }]);
}

/**
 * Generates vendor suggestions based on event type and budget.
 */
export async function generateVendorSuggestions(
  eventType: string,
  budget: number,
  location?: string
): Promise<string> {
  const prompt = `Suggest vendors needed for a ${eventType} event with a budget of $${budget.toLocaleString()}${location ? ` in ${location}` : ''}.

For each vendor category, provide:
1. Why they're needed
2. Estimated cost range (within the budget)
3. Key questions to ask when hiring
4. What to look for in a contract
5. Tips for saving money`;

  return generateAIResponse([{ role: 'user', content: prompt }]);
}

/**
 * Generates budget optimization suggestions.
 */
export async function generateBudgetAdvice(
  eventType: string,
  totalBudget: number,
  currentSpending: { category: string; amount: number }[]
): Promise<string> {
  const spendingDetails = currentSpending
    .map((s) => `- ${s.category}: $${s.amount.toLocaleString()}`)
    .join('\n');

  const totalSpent = currentSpending.reduce((sum, s) => sum + s.amount, 0);
  const remaining = totalBudget - totalSpent;

  const prompt = `Help me optimize the budget for my ${eventType} event.

**Total Budget**: $${totalBudget.toLocaleString()}
**Currently Allocated**:
${spendingDetails}
**Total Allocated**: $${totalSpent.toLocaleString()}
**Remaining**: $${remaining.toLocaleString()}

Please provide:
1. Analysis of current budget allocation
2. Recommendations for areas that might be over/under-allocated
3. Cost-saving tips for each category
4. Suggestions for the remaining budget
5. Priority items to consider`;

  return generateAIResponse([{ role: 'user', content: prompt }]);
}

export { AI_MODEL, SYSTEM_PROMPT };
