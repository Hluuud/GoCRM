# NexCRM Security Guide

## Authentication Flow

```
1. Client sends credentials to POST /api/v1/auth/login
2. Auth Service validates email + bcrypt(password)
3. On success:
   a. Access token (JWT, 15min) set as HttpOnly, Secure, SameSite=Strict cookie
   b. Refresh token (UUID) stored in Redis with TTL=7d and device fingerprint
4. All subsequent requests include the HttpOnly cookie automatically
5. When the access token expires, the client calls POST /auth/refresh
6. The refresh token is validated against Redis, then rotated (old one deleted immediately)
```

## JWT Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "roles": ["ADMIN"],
  "iat": 1710000000,
  "exp": 1710000900
}
```

## Password Policy

- Minimum 8 characters, maximum 128 characters
- Must contain: uppercase, lowercase, number, special character
- bcrypt cost factor: 12 (adjustable via `BCRYPT_ROUNDS` env)
- Passwords are never logged, returned in API responses, or stored in plain text

## Multi-Factor Authentication (TOTP)

- Based on RFC 6238 (Time-based One-Time Passwords)
- Library: `speakeasy` (node.js)
- QR code generated for authenticator app enrollment
- Backup codes generated at enrollment (8 single-use codes)
- MFA bypass is not possible via API — requires direct database intervention by an admin

## Rate Limiting

| Endpoint Pattern | Limit | Window |
|---|---|---|
| `POST /auth/login` | 10 requests | 1 minute (per IP) |
| `POST /auth/register` | 5 requests | 1 hour (per IP) |
| `POST /auth/forgot-password` | 3 requests | 1 hour (per IP + email) |
| All other API routes | 100 requests | 1 minute (per IP) |

## API Keys

- API keys use the format `nexcrm_sk_<32-byte-random-hex>`
- Only the HMAC-SHA256 hash of the key is stored in the database
- Keys have configurable scopes: `read`, `write`, `admin`
- Last-used timestamp is updated on every authenticated request
- Keys can be revoked instantly; revocation is reflected within 1 Redis TTL cycle

## Webhook Security

Outbound webhooks include an `X-NexCRM-Signature` header:
```
X-NexCRM-Signature: sha256=<HMAC-SHA256(secret, raw_body)>
```

Consumers must verify this signature using `crypto.timingSafeEqual` to prevent timing attacks.

## SQL Injection Prevention

All database queries use Prisma's parameterized query system. Raw queries are forbidden by ESLint rule. Prisma's `$queryRaw` and `$executeRaw` are only permitted in the `packages/database` package with explicit review.

## Secrets Management

- Never commit secrets to Git. The `.gitignore` and `.lintstagedrc.js` are configured to catch this.
- In production, inject secrets via environment variables (Docker secrets, Kubernetes secrets, or Vercel environment variables).
- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` periodically — this invalidates all active sessions.

## Audit Logging

Every data mutation (create, update, delete) is written to the `AuditLog` table with:
- `userId` and `tenantId`
- `action` (CREATE | UPDATE | DELETE)
- `resource` (table name)
- `resourceId`
- `oldValues` and `newValues` as JSONB
- `ipAddress` and `userAgent`
- `createdAt` timestamp

Audit logs are append-only — no delete or update operations are allowed on the `AuditLog` table.
