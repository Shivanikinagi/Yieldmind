import * as dotenv from 'dotenv';
dotenv.config();

export async function callVenice(prompt: string): Promise<string> {
  try {
    const res = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
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
      throw new Error(`Venice API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Venice API error:', error);
    return `[Venice API unavailable - demo mode response for: ${prompt.slice(0, 50)}...]`;
  }
}
