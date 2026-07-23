export async function analyzeWithOpenRouter(lines, apiKey, model) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing. Set VITE_OPENROUTER_API_KEY in your .env.local file.');
  }

  const selectedModel = model || 'google/gemini-2.0-flash-001';

  const prompt = `Analyze the sentiment of each of the following tweets.
For each tweet, return:
- "line": exact original tweet text
- "score": floating point score between -5.0 (extremely negative) and +5.0 (extremely positive), with 0.0 representing neutral tone
- "hits": array of key charged words or phrases in the text with sentiment direction, formatted like [{"word": "disappointed", "positive": false}]

Tweets:
${lines.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Respond strictly with a JSON array of objects. Example schema:
[
  {
    "line": "string",
    "score": 3.5,
    "hits": [{"word": "amazing", "positive": true}]
  }
]`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Signal Tweet Sentiment Reader'
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: 'You are a precise, consistent sentiment analyzer. Output only valid JSON arrays.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `OpenRouter HTTP ${response.status}`;
    try {
      const parsedErr = JSON.parse(errorBody);
      if (parsedErr.error?.message) {
        errorMsg = parsedErr.error.message;
      }
    } catch {
      errorMsg = errorBody || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No content returned from OpenRouter AI model.');
  }

  const cleanedJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsedItems = JSON.parse(cleanedJson);

  return parsedItems.map((item, idx) => {
    const score = typeof item.score === 'number' ? item.score : 0;
    const cls = score >= 1.5 ? 'pos' : score <= -1.5 ? 'neg' : 'neu';
    return {
      line: lines[idx] || item.line,
      score,
      hits: Array.isArray(item.hits) ? item.hits : [],
      cls
    };
  });
}
