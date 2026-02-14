const { AzureOpenAI } = require('@azure/openai');

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  endpoint: process.env.AZURE_ENDPOINT,
  apiVersion: '2024-10-21'
});

async function generateCode(context, framework, message = '') {
  const systemPrompt = `You are an expert frontend developer. Generate clean, production-ready code for ${framework}.

RULES:
1. Return ONLY complete working code (no explanations)
2. For React: Complete JSX component with Tailwind CSS
3. For HTML: Single HTML file with inline CSS/JS
4. Use CSS custom properties (--primary-color, --padding, etc.)
5. Preserve existing structure when updating
6. Match image description if provided

Current code:
\`\`\`${context.current_code || ''}\`\`\`

Conversation history:
${context.conversation_history?.map(c => `${c.role}: ${c.message}`).join('\n') || ''}

User request: ${message}

Return ONLY the complete code block.`;

  try {
    const response = await client.getChatCompletions('gpt-4o', [
      { role: 'system', content: systemPrompt },
      ...(context.conversation_history || []).map(msg => ({
        role: msg.role,
        content: msg.message
      })),
      { role: 'user', content: message }
    ]);

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    return '// AI generation failed. Please try again.';
  }
}

module.exports = { generateCode };
