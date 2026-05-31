import type { GatewayTextRequest } from '../types';

export async function completeOpenAICompatible(
  request: GatewayTextRequest,
): Promise<string> {
  const apiKey = request.route.apiKey?.trim();
  if (!apiKey) throw new Error('NO_API_KEY');
  const model = request.route.model?.trim();
  if (!model) throw new Error('NO_MODEL');

  const res = await fetch(resolveChatCompletionsEndpoint(request.route.baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: request.maxTokens ?? 4096,
      messages: [
        { role: 'system', content: request.system },
        { role: 'user', content: request.userContent },
      ],
    }),
    signal: request.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await safeText(res);
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const evt = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const chunk = evt.choices?.[0]?.delta?.content;
        if (chunk) {
          full += chunk;
          request.onDelta?.(chunk);
        }
      } catch {
        /* ignore malformed keep-alive lines */
      }
    }
  }

  return full;
}
function resolveChatCompletionsEndpoint(baseUrl?: string): string {
  const raw = baseUrl?.trim().replace(/\/+$/, '');
  if (!raw) return 'https://api.openai.com/v1/chat/completions';
  if (raw.endsWith('/chat/completions')) return raw;
  if (raw.endsWith('/v1')) return `${raw}/chat/completions`;
  return `${raw}/v1/chat/completions`;
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '<no body>';
  }
}
