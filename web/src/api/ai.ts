import type { AiAssistRequest, AiAssistResponse, AiAdviceRequest, AiAdviceResponse } from "../types/ai";

const API_BASE = "http://localhost:5172";

export async function callAiAssist(
  body: AiAssistRequest,
  token: string
): Promise<AiAssistResponse> {
  const res = await fetch(`${API_BASE}/ai/assist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`AI assist failed: ${res.status}`);
  }

  return res.json();
}

export async function callAiAdvice(
  body: AiAdviceRequest,
  token: string
): Promise<AiAdviceResponse> {
  const res = await fetch(`${API_BASE}/ai/advice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`AI advice failed: ${res.status}`);
  }

  return res.json();
}
