import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Injectable({ providedIn: 'root' })
export class SanitizationService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'code', 'pre', 'h2', 'h3', 'h4',
        'ul', 'ol', 'li', 'div', 'span', 'a', 'img', 'table', 'thead',
        'tbody', 'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style',
        'lang',
      ],
      ALLOW_DATA_ATTR: false,
    });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
