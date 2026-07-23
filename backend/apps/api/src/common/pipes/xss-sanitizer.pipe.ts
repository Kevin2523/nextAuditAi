import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class XssSanitizerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    
    return value;
  }

  private sanitizeString(str: string): string {
    // Escapa los caracteres HTML peligrosos para prevenir ataques XSS
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  private sanitizeObject(obj: any): any {
    const sanitizedObj = { ...obj };
    for (const key in sanitizedObj) {
      if (typeof sanitizedObj[key] === 'string') {
        sanitizedObj[key] = this.sanitizeString(sanitizedObj[key]);
      } else if (typeof sanitizedObj[key] === 'object' && sanitizedObj[key] !== null) {
        sanitizedObj[key] = this.sanitizeObject(sanitizedObj[key]);
      }
    }
    return sanitizedObj;
  }
}
