import axios from 'axios';

// Abstract environment checks safely onto variables to drop IDE red squiggly error tracking lines
const runtimeEnv = typeof globalThis !== 'undefined' ? (globalThis.process?.env || {}) : {};

const OPENROUTER_KEY = runtimeEnv.OPENROUTER_API_KEY || '';
const REFERER_URL = runtimeEnv.APP_REFERER_URL || 'https://expenseflow.ai';

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_KEY}`,
    'HTTP-Referer': REFERER_URL,
    'X-Title': 'ExpenseFlow AI Ledger Platform',
    'Content-Type': 'application/json'
  }
});

/**
 * Parses raw input text into structured JSON fields for expense tracking
 */
export const parseAiQuickAddPrompt = async (textPrompt, groupMembers) => {
  try {
    const memberMapDescription = groupMembers.map(m => `${m.user.name} (id: ${m.userId})`).join(', ');
    
    const contextPrompt = `
      Analyze this text: "${textPrompt}".
      Available group members mapping matrix: [${memberMapDescription}].
      
      Extract:
      1. Total amount in CENTS (integer).
      2. Description.
      3. Payer user ID.
      4. Split matrix array mapping exact owed amount cents per matching participant.
      
      Return ONLY clean JSON:
      {
        "amountCents": 12000,
        "description": "Dinner",
        "payerId": "string_id",
        "splits": [{ "userId": "string_id", "amountCents": 6000 }]
      }
    `;

    const response = await openRouterClient.post('/chat/completions', {
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: contextPrompt }]
    });

    const cleanRawJson = response.data.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanRawJson);
  } catch (error) {
    console.error('// OpenRouter parsing transaction exception:', error.message);
    throw new Error('AI parsing failed to cleanly model the transaction prompt.');
  }
};