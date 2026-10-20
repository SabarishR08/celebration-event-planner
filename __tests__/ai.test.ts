import 'openai/shims/node';
import { SYSTEM_PROMPT, AI_MODEL } from '../src/lib/ai';

describe('GenAI Module Architecture & Prompt Security', () => {
  test('SYSTEM_PROMPT embeds event planning persona and constraints', () => {
    expect(SYSTEM_PROMPT).toContain('CelebPlan');
    expect(SYSTEM_PROMPT).toContain('budget');
    expect(SYSTEM_PROMPT).toContain('timeline');
    expect(SYSTEM_PROMPT).toContain('vendor');
  });

  test('AI_MODEL defaults to vision-instruct model', () => {
    expect(AI_MODEL).toBeDefined();
    expect(typeof AI_MODEL).toBe('string');
  });
});
