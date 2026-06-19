import * as crypto from 'crypto';

/**
 * Gera um token aleatório seguro (hex).
 * @param bytes Número de bytes (default: 32 = 64 chars hex)
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Gera um hash SHA-256 de um token para armazenar no banco
 * sem expor o valor real.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Gera um código OTP numérico de N dígitos.
 */
export function generateOtpCode(digits = 6): string {
  const max = Math.pow(10, digits);
  const randomValue = crypto.randomInt(0, max);
  return randomValue.toString().padStart(digits, '0');
}

/**
 * Compara duas strings de forma segura contra timing attacks.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

/**
 * Extrai o prefixo de um token para exibição (ex: "nx_abc123...").
 */
export function getTokenPrefix(token: string, prefixLength = 8): string {
  return token.substring(0, prefixLength);
}

/**
 * Gera um ID de request curto para correlação de logs.
 */
export function generateRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}
