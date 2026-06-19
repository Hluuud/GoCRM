import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

interface SessionData {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  ip: string;
  userAgent: string;
  deviceFingerprint?: string;
  createdAt: string;
  lastActivityAt: string;
}

@Injectable()
export class SessionsService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  // Prefixes
  private readonly SESSION_PREFIX = 'session:';
  private readonly REFRESH_PREFIX = 'refresh:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly BRUTE_FORCE_PREFIX = 'brute:';

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis({
      host: this.config.get<string>('redis.host', 'localhost'),
      port: this.config.get<number>('redis.port', 6379),
      password: this.config.get<string>('redis.password'),
      db: this.config.get<number>('redis.db', 0),
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  // ── Refresh Tokens ──────────────────────────────────────────────────────────

  async storeRefreshToken(
    userId: string,
    tenantId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `${this.REFRESH_PREFIX}${token}`;
    await this.redis.setex(key, ttlSeconds, JSON.stringify({ userId, tenantId }));
  }

  async getRefreshTokenData(token: string): Promise<{ userId: string; tenantId: string } | null> {
    const key = `${this.REFRESH_PREFIX}${token}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.redis.del(`${this.REFRESH_PREFIX}${token}`);
  }

  async rotateRefreshToken(
    oldToken: string,
    userId: string,
    tenantId: string,
    newToken: string,
    ttlSeconds: number,
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`${this.REFRESH_PREFIX}${oldToken}`);
    pipeline.setex(`${this.REFRESH_PREFIX}${newToken}`, ttlSeconds, JSON.stringify({ userId, tenantId }));
    await pipeline.exec();
  }

  // ── Sessions ────────────────────────────────────────────────────────────────

  async createSession(data: Omit<SessionData, 'createdAt' | 'lastActivityAt'>, ttlSeconds: number): Promise<string> {
    const sessionId = randomUUID();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData: SessionData = {
      ...data,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    await this.redis.setex(key, ttlSeconds, JSON.stringify(sessionData));

    // Adiciona à lista de sessões do usuário
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${data.userId}`;
    await this.redis.sadd(userSessionsKey, sessionId);
    await this.redis.expire(userSessionsKey, ttlSeconds);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async touchSession(sessionId: string, ttlSeconds: number): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await this.redis.get(key);
    if (data) {
      const session = JSON.parse(data) as SessionData;
      session.lastActivityAt = new Date().toISOString();
      await this.redis.setex(key, ttlSeconds, JSON.stringify(session));
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await this.redis.get(key);
    if (data) {
      const session = JSON.parse(data) as SessionData;
      await this.redis.del(key);
      await this.redis.srem(`${this.USER_SESSIONS_PREFIX}${session.userId}`, sessionId);
    }
  }

  async getUserSessions(userId: string): Promise<Array<SessionData & { sessionId: string }>> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await this.redis.smembers(userSessionsKey);
    const sessions: Array<SessionData & { sessionId: string }> = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push({ ...session, sessionId });
      } else {
        // Sessão expirou — limpa da lista
        await this.redis.srem(userSessionsKey, sessionId);
      }
    }

    return sessions.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
    );
  }

  async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await this.redis.smembers(userSessionsKey);
    let revoked = 0;

    for (const sessionId of sessionIds) {
      if (sessionId !== exceptSessionId) {
        await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
        await this.redis.srem(userSessionsKey, sessionId);
        revoked++;
      }
    }

    return revoked;
  }

  // ── Brute-force mitigation ───────────────────────────────────────────────────

  async recordFailedLogin(identifier: string): Promise<number> {
    const key = `${this.BRUTE_FORCE_PREFIX}${identifier}`;
    const attempts = await this.redis.incr(key);
    if (attempts === 1) {
      // Primeiro erro: define expiração de 15 minutos
      await this.redis.expire(key, 900);
    }
    return attempts;
  }

  async getFailedLoginAttempts(identifier: string): Promise<number> {
    const val = await this.redis.get(`${this.BRUTE_FORCE_PREFIX}${identifier}`);
    return val ? parseInt(val, 10) : 0;
  }

  async clearFailedLoginAttempts(identifier: string): Promise<void> {
    await this.redis.del(`${this.BRUTE_FORCE_PREFIX}${identifier}`);
  }

  async getLockoutTtl(identifier: string): Promise<number> {
    return this.redis.ttl(`${this.BRUTE_FORCE_PREFIX}${identifier}`);
  }
}
