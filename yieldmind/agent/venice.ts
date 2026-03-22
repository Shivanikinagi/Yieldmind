import * as dotenv from 'dotenv';
dotenv.config();

export async function callVenice(prompt: string): Promise<string> {
  if (!process.env.VENICE_API_KEY) {
    throw new Error('VENICE_API_KEY not set in .env');
  }

  const model = process.env.VENICE_MODEL || 'llama-3.3-70b';
  
  try {
    const res = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are YieldMind, an autonomous AI agent. Your compute is funded by staking yield. Be concise.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Venice API error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('❌ Venice API error:', error.message);
    throw error;
  }
}
