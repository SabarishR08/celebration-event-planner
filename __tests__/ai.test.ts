import 'openai/shims/node';
import { SYSTEM_PROMPT, AI_MODEL, TOKEN_BUDGETS, generateStructuredTimeline } from '../src/lib/ai';

describe('GenAI Module Architecture, Token Ceilings & Structured Output', () => {
  test('SYSTEM_PROMPT embeds event planning persona and constraints', () => {
    expect(SYSTEM_PROMPT).toContain('CelebPlan');
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('budget');
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('timeline');
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('vendor');
  });

  test('AI_MODEL defaults to meta/llama-3.1-70b-instruct for high-tier generation', () => {
    expect(AI_MODEL).toBeDefined();
    expect(AI_MODEL).toBe('meta/llama-3.1-70b-instruct');
  });

  test('TOKEN_BUDGETS enforces fine-tuned ceilings per operation', () => {
    expect(TOKEN_BUDGETS.CHAT_CONCIERGE).toBeLessThanOrEqual(800);
    expect(TOKEN_BUDGETS.BUDGET_ADVICE).toBeLessThanOrEqual(500);
    expect(TOKEN_BUDGETS.VENDOR_SUGGESTIONS).toBeLessThanOrEqual(600);
    expect(TOKEN_BUDGETS.STRUCTURED_TIMELINE).toBeLessThanOrEqual(600);
    expect(TOKEN_BUDGETS.FULL_EVENT_PLAN).toBeGreaterThanOrEqual(1000);
  });

  test('generateStructuredTimeline provides deterministic fallback milestones on offline/error', async () => {
    const milestones = await generateStructuredTimeline({
      title: 'Summer Solstice Gala',
      event_type: 'community',
      guest_count: 150,
      location: 'Botanical Gardens',
    });

    expect(Array.isArray(milestones)).toBe(true);
    expect(milestones.length).toBeGreaterThanOrEqual(5);
    expect(milestones[0]).toHaveProperty('title');
    expect(milestones[0]).toHaveProperty('start_time');
    expect(milestones[0]).toHaveProperty('category');
    expect(milestones[0]).toHaveProperty('sort_order');
  });
});
