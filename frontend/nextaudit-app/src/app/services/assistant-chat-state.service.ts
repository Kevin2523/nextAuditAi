import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

export interface SaaSMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  html?: SafeHtml;
  time: string;
  isTyping?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AssistantChatStateService {
  readonly messages: SaaSMessage[] = [];
  sessionId: string | null = null;
  hasWelcomeMessage = false;
  isTyping = false;
}
