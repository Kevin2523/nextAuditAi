export interface WafRule {
  name: string;
  attack: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  locations: ('body' | 'query' | 'params' | 'headers' | 'path')[];
}

export const WAF_RULES: WafRule[] = [
  {
    name: 'SQL_INJECTION_1',
    attack: 'SQL Injection',
    pattern: /(\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b|\bUPDATE\b.*\bSET\b|\bDELETE\b.*\bFROM\b|\bDROP\b.*\bTABLE\b|\bUNION\b.*\bSELECT\b)/i,
    severity: 'critical',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'SQL_INJECTION_2',
    attack: 'SQL Injection - OR/AND',
    pattern: /('|")\s*(OR|AND)\s+.*=.*/i,
    severity: 'critical',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'SQL_INJECTION_3',
    attack: 'SQL Injection - Comments',
    pattern: /--|#|\/\*/,
    severity: 'high',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'XSS_1',
    attack: 'Cross-Site Scripting - Script tags',
    pattern: /<script\b[^>]*>[\s\S]*?<\/script\s*>/i,
    severity: 'critical',
    locations: ['body', 'query', 'params', 'headers'],
  },
  {
    name: 'XSS_2',
    attack: 'Cross-Site Scripting - Event handlers',
    pattern: /\son\w+\s*=\s*['"][^'"]*['"]/i,
    severity: 'high',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'XSS_3',
    attack: 'Cross-Site Scripting - javascript: protocol',
    pattern: /javascript:\s*[/@a-zA-Z]/i,
    severity: 'critical',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'PATH_TRAVERSAL',
    attack: 'Path Traversal',
    pattern: /(\.\.\/|\.\.\\|%2e%2e\/|%2e%2e\\|\.\.%2f|%252e%252e)/i,
    severity: 'high',
    locations: ['body', 'query', 'params', 'path'],
  },
  {
    name: 'COMMAND_INJECTION_1',
    attack: 'OS Command Injection - Chaining',
    pattern: /;\s*(rm|cat|wget|curl|bash|sh|python|perl|nc|nmap|chmod|chown|mkfs|dd|halt|reboot|poweroff)/i,
    severity: 'critical',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'COMMAND_INJECTION_2',
    attack: 'OS Command Injection - Subshell',
    pattern: /\$\(.*\)|`[^`]*`/,
    severity: 'critical',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'COMMAND_INJECTION_3',
    attack: 'OS Command Injection - Pipe',
    pattern: /\|\s*(cat|sh|bash|python|perl|nc|nmap|wget|curl|rm|whoami|id|uname)/i,
    severity: 'high',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'LDAP_INJECTION',
    attack: 'LDAP Injection',
    pattern: /[()&|!]\(.*\)|\)\s*\(\s*uid\s*=|\)\s*\|\s*\(/i,
    severity: 'high',
    locations: ['body', 'query', 'params'],
  },
  {
    name: 'NOSQL_INJECTION',
    attack: 'NoSQL Injection',
    pattern: /\$\s*(gt|gte|lt|lte|ne|eq|in|nin|regex|exists|where|and|or|nor)\s*:/i,
    severity: 'high',
    locations: ['body'],
  },
  {
    name: 'CONTENT_TYPE_MISMATCH',
    attack: 'Content-Type manipulation',
    pattern: /application\/x-www-form-urlencoded|multipart\/form-data/i,
    severity: 'low',
    locations: ['headers'],
  },
];

export const SUSPICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /nmap/i,
  /gobuster/i,
  /dirb/i,
  /wpscan/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /burpsuite/i,
  /netsparker/i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /scrapy/i,
  /curl\s\/7\./i,
  /wget\s\/1\./i,
];
