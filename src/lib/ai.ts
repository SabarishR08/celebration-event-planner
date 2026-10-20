import OpenAI from 'openai';

/**
 * NVIDIA AI client using OpenAI-compatible API.
 * Uses meta/llama-3.1-70b-instruct for high-fidelity celebration planning assistance.
 */
function getAIClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || '',
    baseURL: process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1',
    dangerouslyAllowBrowser: true,
  });
}

export const AI_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

/**
 * Granular token ceilings per AI operation to enforce strict efficiency,
 * minimize API latency, and avoid token exhaustion.
 */
export const TOKEN_BUDGETS = {
  CHAT_CONCIERGE: 800,        // Fast conversational answers with 10-message bounded context
  FULL_EVENT_PLAN: 1500,      // Exhaustive multi-category milestone breakdown
  VENDOR_SUGGESTIONS: 600,    // Scoped category directory guidance
  BUDGET_ADVICE: 500,         // Crisp ledger optimization insights
  STRUCTURED_TIMELINE: 600,   // JSON timeline array for direct DB ingestion
} as const;

/**
 * System prompt for the celebration planning assistant.
 */
export const SYSTEM_PROMPT = `You are CelebPlan AI, an expert celebration atelier assistant. You help users organize weddings, birthdays, anniversaries, community events, and corporate celebrations.

Your capabilities include:
1. Event Planning: Create comprehensive event plans with milestones and checklists
2. Budget Management: Suggest budget allocations and cost-saving strategies
3. Vendor Selection: Suggest vendor categories with negotiation tips
4. Guest Experience: Advise on hospitality, seating, and dietary inclusivity
5. Theme & Styling: Provide creative aesthetic directions and color palettes
6. Day-of Timelines: Build chronological run-of-show schedules

Guidelines:
- Maintain an encouraging, sophisticated, and supportive tone
- Provide specific, actionable advice with realistic price and time estimates
- Format responses cleanly with markdown headings and concise bullet points
- Always consider accessibility, dietary accommodations, and guest comfort`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generates an AI response for event planning queries with tuned token budgets.
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  eventContext?: string,
  options?: AIRequestOptions
): Promise<string> {
  try {
    const systemMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (eventContext) {
      systemMessages.push({
        role: 'system',
        content: `Current celebration context:\n${eventContext}`,
      });
    }

    const aiClient = getAIClient();
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [...systemMessages, ...messages],
      max_tokens: options?.maxTokens || TOKEN_BUDGETS.CHAT_CONCIERGE,
      temperature: options?.temperature ?? 0.7,
      top_p: 0.9,
    });

    return (
      response.choices[0]?.message?.content ||
      'I apologize, but I was unable to compose a response. Please try again.'
    );
  } catch (error) {
    console.error('AI response generation error:', error);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
}

/**
 * Generates an end-to-end event plan with custom token budget.
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
  const prompt = `Please create a comprehensive event plan for this celebration:
- Type: ${eventDetails.type}
- Budget: $${eventDetails.budget.toLocaleString()}
- Expected Guests: ${eventDetails.guestCount}
${eventDetails.date ? `- Date: ${eventDetails.date}` : ''}
${eventDetails.location ? `- Location: ${eventDetails.location}` : ''}
${eventDetails.theme ? `- Theme: ${eventDetails.theme}` : ''}
${eventDetails.notes ? `- Notes: ${eventDetails.notes}` : ''}

Provide:
1. Budget breakdown with percentage allocations
2. Milestone checklist working backward from celebration date
3. Priority vendor directory requirements
4. Day-of run of show highlights`;

  return generateAIResponse([{ role: 'user', content: prompt }], undefined, {
    maxTokens: TOKEN_BUDGETS.FULL_EVENT_PLAN,
    temperature: 0.7,
  });
}

/**
 * Generates vendor suggestions with scoped token budget.
 */
export async function generateVendorSuggestions(
  eventType: string,
  budget: number,
  location?: string
): Promise<string> {
  const prompt = `Suggest essential vendor categories for a ${eventType} with a budget of $${budget.toLocaleString()}${location ? ` in ${location}` : ''}.
For each category give: estimated budget share, key contract questions, and cost-saving tip.`;

  return generateAIResponse([{ role: 'user', content: prompt }], undefined, {
    maxTokens: TOKEN_BUDGETS.VENDOR_SUGGESTIONS,
    temperature: 0.6,
  });
}

/**
 * Generates budget optimization suggestions with minimal token spend.
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

  const prompt = `Analyze budget for a ${eventType}:
Total: $${totalBudget.toLocaleString()}
Allocated: $${totalSpent.toLocaleString()}
Remaining: $${remaining.toLocaleString()}
Line items:
${spendingDetails}

Give 3 quick recommendations to rebalance or protect the remaining buffer.`;

  return generateAIResponse([{ role: 'user', content: prompt }], undefined, {
    maxTokens: TOKEN_BUDGETS.BUDGET_ADVICE,
    temperature: 0.5,
  });
}

export interface StructuredTimelineMilestone {
  title: string;
  description: string;
  start_time: string;
  category: string;
  sort_order: number;
}

/**
 * Generates a structured JSON timeline array that the application parses
 * directly into timeline table rows.
 */
export async function generateStructuredTimeline(event: {
  title: string;
  event_type: string;
  guest_count: number;
  location?: string;
  theme?: string;
}): Promise<StructuredTimelineMilestone[]> {
  const prompt = `Create a realistic chronological 5-moment run-of-show itinerary for this celebration:
Event: "${event.title}" (${event.event_type})
Guest Count: ${event.guest_count}
${event.theme ? `Theme: ${event.theme}` : ''}
${event.location ? `Location: ${event.location}` : ''}

Respond ONLY with a valid JSON array of 5 objects matching this exact structure:
[
  {
    "title": "Vendor Arrival & Setup",
    "description": "Catering and staging check-in",
    "start_time": "15:00",
    "category": "Setup",
    "sort_order": 1
  }
]`;

  try {
    const raw = await generateAIResponse(
      [{ role: 'user', content: prompt }],
      undefined,
      { maxTokens: TOKEN_BUDGETS.STRUCTURED_TIMELINE, temperature: 0.4 }
    );

    // Extract JSON block if wrapped in markdown
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, index) => ({
          title: String(item.title || `Moment ${index + 1}`),
          description: String(item.description || ''),
          start_time: String(item.start_time || '18:00'),
          category: String(item.category || 'General'),
          sort_order: Number(item.sort_order || index + 1),
        }));
      }
    }
  } catch (err) {
    console.warn('AI structured timeline parsing fallback:', err);
  }

  // Graceful deterministic fallback if AI is rate-limited or JSON malformed
  return [
    { title: 'Vendor Check-in & Audio Check', description: 'Catering and staging readiness', start_time: '15:00', category: 'Logistics', sort_order: 1 },
    { title: 'Guest Arrival & Welcome Refreshments', description: 'Greeting attendees and welcome beverage service', start_time: '17:30', category: 'Reception', sort_order: 2 },
    { title: 'Ceremony / Opening Remarks', description: 'Core celebration ceremony and formal welcome', start_time: '18:30', category: 'Ceremony', sort_order: 3 },
    { title: 'Dinner / Banquet Service', description: 'Catered dining service and celebratory toasts', start_time: '19:30', category: 'Dining', sort_order: 4 },
    { title: 'Celebration Music & Farewell', description: 'Dancing, music, and closing farewell', start_time: '21:30', category: 'Entertainment', sort_order: 5 },
  ];
}
