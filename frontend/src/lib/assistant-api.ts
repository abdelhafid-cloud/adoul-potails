const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function streamAssistantMessage(
  conversationId: string,
  message: string,
  onToken: (token: string) => void,
  onError?: (msg: string) => void,
): Promise<void> {
  const res = await fetch(`${API_URL}/ai/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erreur serveur" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Streaming non supporté");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const data = JSON.parse(payload) as { token?: string; error?: string };
        if (data.error) {
          onError?.(data.error);
          return;
        }
        if (data.token) onToken(data.token);
      } catch {
        if (payload) onToken(payload);
      }
    }
  }
}
