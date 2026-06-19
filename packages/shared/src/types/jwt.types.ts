export interface JwtPayload {
  /** UUID do usuário */
  sub: string;
  /** Email do usuário */
  email: string;
  /** UUID do tenant ativo */
  tenantId: string;
  /** Nome do tenant */
  tenantSlug: string;
  /** Role do usuário no tenant */
  roles: string[];
  /** Permissões granulares */
  permissions?: string[];
  /** Session ID (para revogação) */
  sessionId?: string;
  /** Issued at */
  iat?: number;
  /** Expiration */
  exp?: number;
  /** Tipo do token: access | refresh */
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
}
