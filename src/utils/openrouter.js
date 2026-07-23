const FALLBACK_MODELS = [
  'openrouter/free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free'
];

function extractJsonArray(rawText) {
  const text = String(rawText || '').trim();
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const jsonSubstring = text.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(jsonSubstring);
    } catch {
      // Fallback to cleaning backticks if substring parse failed
    }
  }

  const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedJson);
}

async function callOpenRouter(lines, apiKey, modelName) {
  const cleanKey = String(apiKey || '').trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '');
  if (!cleanKey) {
    throw new Error('API key is empty after cleaning.');
  }

  const prompt = `Analyze the sentiment of each of the following tweets.
For each tweet, return:
- "line": exact original tweet text
- "score": floating point score between -5.0 (extremely negative) and +5.0 (extremely positive), with 0.0 representing neutral tone
- "hits": array of key charged words or phrases in the text with sentiment direction, formatted like [{"word": "disappointed", "positive": false}]

Tweets:
${lines.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Respond strictly with a JSON array of objects. Do not include introductory text like safety notes or explanations. Example schema:
[
  {
    "line": "string",
    "score": 3.5,
    "hits": [{"word": "amazing", "positive": true}]
  }
]`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cleanKey}`
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a precise sentiment analysis API. Respond only with raw JSON arrays without any extra text, headings, or safety notes.'
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
    let errorMsg = `HTTP ${response.status}`;
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
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No content returned from OpenRouter AI model.');
  }

  const parsedItems = extractJsonArray(rawContent);

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

export async function analyzeWithOpenRouter(lines, apiKey, model) {
  const cleanKey = String(apiKey || '').trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '');
  if (!cleanKey) {
    throw new Error('OpenRouter API key is missing. Set VITE_OPENROUTER_API_KEY in your .env.local file.');
  }

  let preferredModel = model || 'openrouter/free';
  if (preferredModel.includes('gemini-2.0-flash-001') || preferredModel.includes('llama-3.3-70b-instruct:free')) {
    preferredModel = 'openrouter/free';
  }

  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];

  let lastError = null;

  for (const m of modelsToTry) {
    try {
      return await callOpenRouter(lines, cleanKey, m);
    } catch (err) {
      lastError = err;
      if (
        err.message.includes('No endpoints found') ||
        err.message.includes('unavailable for free') ||
        err.message.includes('404') ||
        err.message.includes('Provider returned error') ||
        err.message.includes('Insufficient credits') ||
        err.message.includes('is not valid JSON') ||
        err.message.includes('JSON')
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to connect to OpenRouter AI models.');
}
