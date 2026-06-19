import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaService {
  constructor(private config: ConfigService) {
    // Configura TOTP: janela de 1 passo (±30s) para tolerância de clock skew
    authenticator.options = { window: 1 };
  }

  generateSecret(email: string): { secret: string; otpauth: string } {
    const issuer = this.config.get<string>('mfa.issuer', 'NexCRM');
    const secret = authenticator.generateSecret(32);
    const otpauth = authenticator.keyuri(email, issuer, secret);
    return { secret, otpauth };
  }

  async generateQrCodeDataUrl(otpauth: string): Promise<string> {
    return qrcode.toDataURL(otpauth, {
      errorCorrectionLevel: 'M',
      width: 256,
      margin: 2,
    });
  }

  verifyToken(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token: token.replace(/\s/g, ''), secret });
    } catch {
      return false;
    }
  }

  generateBackupCodes(count = 10): string[] {
    return Array.from({ length: count }, () =>
      Math.random().toString(36).slice(2, 10).toUpperCase(),
    );
  }
}
