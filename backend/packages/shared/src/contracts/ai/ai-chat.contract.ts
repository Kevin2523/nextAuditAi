export interface AiChatRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface AiChatResponse {
  text: string;
  sessionId?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostUsd?: number;
  };
}
