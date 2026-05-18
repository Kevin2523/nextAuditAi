import { Component, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { FlowiseService } from '../../services/flowise.service';
import { AssistantChatStateService, SaaSMessage } from '../../services/assistant-chat-state.service';

interface SpeechChunk {
  text: string;
  lang: 'es-ES' | 'en-US';
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css'
})
export class Assistant implements AfterViewInit {
  @ViewChild('scrollArea') private scrollArea!: ElementRef;

  messages: SaaSMessage[] = [];
  userInput = '';
  isRecording = false;
  recognition: any = null;
  isVoiceEnabled = true;
  private voices: SpeechSynthesisVoice[] = [];

  suggestions = [
    'Resumen de seguridad de hoy',
    'Mostrar equipos en estado de riesgo',
    'Activar motor de autosanación',
    'Generar reporte de cumplimiento'
  ];

  constructor(
    private flowise: FlowiseService,
    private sanitizer: DomSanitizer,
    private chatState: AssistantChatStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.messages = this.chatState.messages;
    this.loadVoices();
    window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
  }

  ngAfterViewInit() {
    if (this.chatState.hasWelcomeMessage) {
      this.scrollToBottom();
      return;
    }

    const welcomeText = 'Hola, soy tu Asistente de Seguridad. Estoy preparado para analizar tu flota, detectar vulnerabilidades y aplicar reparación autónoma de forma segura. ¿En qué te puedo ayudar hoy?';

    this.messages.push({
      id: 'w-1',
      sender: 'assistant',
      text: welcomeText,
      html: this.sanitizer.bypassSecurityTrustHtml(`
         <p class="font-semibold text-[#0F172A] mb-1">Hola, soy tu Asistente de Seguridad.</p>
         <p class="text-[#475569]">Estoy preparado para analizar tu flota, detectar vulnerabilidades y aplicar reparación autónoma de forma segura. ¿En qué te puedo ayudar hoy?</p>
      `),
      time: this.getTime()
    });
    this.chatState.hasWelcomeMessage = true;
    this.cdr.detectChanges();
  }

  get isTyping() {
    return this.chatState.isTyping;
  }

  getTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollArea) {
        this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
      }
    }, 50);
  }

  async sendMessage(override?: string, isAudioRequest: boolean = false) {
    const text = override || this.userInput.trim();
    if (!text || this.isTyping) return;

    if (!override) this.userInput = '';

    this.messages.push({ id: 'u-'+Date.now(), sender: 'user', text, time: this.getTime() });

    this.chatState.isTyping = true;
    const typingId = 't-'+Date.now();
    this.messages.push({
      id: typingId,
      sender: 'assistant',
      text: 'Preparando respuesta',
      html: this.sanitizer.bypassSecurityTrustHtml('<span class="text-[#64748B] font-medium">Preparando respuesta</span>'),
      isTyping: true,
      time: this.getTime()
    });
    this.scrollToBottom();

    try {
      const res = await this.flowise.sendMessage(text, this.chatState.sessionId ?? undefined);
      this.chatState.sessionId = res.sessionId ?? this.chatState.sessionId;

      this.removeMessage(typingId);
      const assistantMessage: SaaSMessage = {
        id: 'a-'+Date.now(),
        sender: 'assistant',
        text: this.isVoiceEnabled && isAudioRequest ? 'Iniciando lectura' : res.text,
        html: this.sanitizer.bypassSecurityTrustHtml(
          this.isVoiceEnabled && isAudioRequest
            ? '<span class="text-[#64748B] font-medium">Iniciando lectura</span>'
            : this.flowise.formatMarkdown(res.text)
        ),
        time: this.getTime()
      };

      this.messages.push(assistantMessage);

      if (this.isVoiceEnabled && isAudioRequest) {
        this.speakResponse(res.text, (spokenText) => {
          assistantMessage.text = spokenText;
          assistantMessage.html = this.sanitizer.bypassSecurityTrustHtml(this.flowise.formatMarkdown(spokenText));
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
    } catch {
      this.removeMessage(typingId);
      this.messages.push({
        id: 'err', sender: 'assistant', text: '',
        html: this.sanitizer.bypassSecurityTrustHtml('<span class="text-red-500 font-medium">Ocurrió un error al contactar al motor de análisis.</span>'),
        time: this.getTime()
      });
    }

    this.chatState.isTyping = false;
    this.scrollToBottom();
  }

  private removeMessage(id: string) {
    const index = this.messages.findIndex(m => m.id === id);
    if (index >= 0) {
      this.messages.splice(index, 1);
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  toggleVoice() {
    if (this.isRecording) {
      this.stopVoice();
    } else {
      this.startVoice();
    }
  }

  startVoice() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    this.recognition = new SR();
    this.recognition.lang = 'es-PA';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.onstart = () => { this.isRecording = true; this.cdr.detectChanges(); };
    this.recognition.onresult = (e: any) => {
      this.stopVoice();
      this.sendMessage(e.results[0][0].transcript, true);
    };
    this.recognition.onerror = () => this.stopVoice();
    this.recognition.onend = () => this.stopVoice();
    this.recognition.start();
  }

  stopVoice() {
    this.isRecording = false;
    if (this.recognition) this.recognition.stop();
    this.cdr.detectChanges();
  }

  toggleVoiceEnabled() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (!this.isVoiceEnabled) {
      window.speechSynthesis.cancel();
    }
  }

  speakResponse(text: string, onProgress?: (spokenText: string) => void) {
    const synth = window.speechSynthesis;
    synth.cancel();

    const chunks = this.splitSpeechByLanguage(this.cleanTextForSpeech(text));
    let spoken = '';

    const speakChunk = (index: number) => {
      const chunk = chunks[index];
      if (!chunk) return;

      const utterance = new SpeechSynthesisUtterance(chunk.text);
      const selectedVoice = this.selectNaturalVoice(chunk.lang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = selectedVoice?.lang || chunk.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onboundary = (event) => {
        if (event.name !== 'word' && event.charIndex === undefined) return;
        const visibleChunk = chunk.text.slice(0, event.charIndex + event.charLength);
        onProgress?.((spoken + visibleChunk).trim());
      };
      utterance.onend = () => {
        spoken = `${spoken}${chunk.text} `.trimStart();
        onProgress?.(spoken.trim());
        speakChunk(index + 1);
      };
      utterance.onerror = () => speakChunk(index + 1);

      synth.speak(utterance);
    };

    speakChunk(0);
  }

  private loadVoices() {
    this.voices = window.speechSynthesis.getVoices();
  }

  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, ' bloque de código ')
      .replace(/[*#_`>\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, ' enlace ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private splitSpeechByLanguage(text: string): SpeechChunk[] {
    const sentenceMatches = text.match(/[^.!?¿¡]+[.!?¿¡]*/g) || [text];
    return sentenceMatches
      .map(sentence => {
        const cleanSentence = sentence.trim();
        return cleanSentence
          ? { text: `${cleanSentence} `, lang: this.detectSpeechLanguage(cleanSentence) }
          : null;
      })
      .filter((chunk): chunk is SpeechChunk => Boolean(chunk));
  }

  private detectSpeechLanguage(text: string): 'es-ES' | 'en-US' {
    const normalized = text.toLowerCase();
    const spanishSignals = /[áéíóúñü¿¡]|\b(el|la|los|las|un|una|que|para|por|con|sin|seguridad|cumplimiento|riesgo|reporte|equipos|vulnerabilidades|remediación|autónoma)\b/;
    const englishSignals = /\b(the|and|or|with|without|security|compliance|risk|report|hosts|devices|vulnerabilities|remediation|endpoint|dashboard|login|status|high|critical|low)\b/;

    if (englishSignals.test(normalized) && !spanishSignals.test(normalized)) {
      return 'en-US';
    }

    return 'es-ES';
  }

  private selectNaturalVoice(lang: 'es-ES' | 'en-US'): SpeechSynthesisVoice | undefined {
    const voices = this.voices.length ? this.voices : window.speechSynthesis.getVoices();
    const langPrefix = lang.slice(0, 2);
    const naturalPriority = ['Natural', 'Neural', 'Online', 'Premium', 'Google', 'Microsoft'];

    return voices.find(v => v.lang === lang && naturalPriority.some(token => v.name.includes(token)))
      || voices.find(v => v.lang.startsWith(langPrefix) && naturalPriority.some(token => v.name.includes(token)))
      || voices.find(v => v.lang === lang)
      || voices.find(v => v.lang.startsWith(langPrefix));
  }
}
