# API Reference — NexCRM

All requests go through the **API Gateway** (`http://localhost:3000/api/v1`).

Authentication uses JWT Bearer tokens. Include the token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Auth Service — `/api/v1/auth`

### POST `/auth/register`
Register a new user and tenant.

**Body:**
```json
{
  "name": "Rafael Mendes",
  "email": "rafael@nexcrm.io",
  "password": "Min8Chars!",
  "tenantName": "NexCRM Ltda",
  "tenantSlug": "nexcrm"
}
```

**Response `201`:**
```json
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "tenant": { "id": "uuid", "name": "...", "slug": "..." }
}
```

---

### POST `/auth/login`
Authenticate and receive tokens.

**Body:**
```json
{ "email": "rafael@nexcrm.io", "password": "Min8Chars!" }
```

**Response `200`:** Sets `access_token` and `refresh_token` as `HttpOnly` cookies.

```json
{
  "accessToken": "eyJ...",
  "expiresIn": 900,
  "user": { "id": "uuid", "email": "...", "role": "ADMIN" }
}
```

---

### POST `/auth/refresh`
Exchange a valid refresh token for a new access token (rotation).

**Cookies required:** `refresh_token`

**Response `200`:** New `access_token` cookie set.

---

### POST `/auth/logout`
Invalidates the current session. Clears cookies.

---

### GET `/auth/me`
Returns the authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

---

### POST `/auth/forgot-password`
Sends a password reset email.

**Body:** `{ "email": "rafael@nexcrm.io" }`

---

### POST `/auth/reset-password`
Resets the password using a valid token.

**Body:**
```json
{ "token": "reset-token-from-email", "password": "NewPass123!" }
```

---

## MFA — `/api/v1/mfa`

### POST `/mfa/setup`
Generate a TOTP secret and QR code URI.

### POST `/mfa/verify`
Verify a TOTP code and activate MFA.

### POST `/mfa/disable`
Disable MFA (requires current password).

---

## Sessions — `/api/v1/sessions`

### GET `/sessions`
List all active sessions for the current user.

### DELETE `/sessions/:id`
Revoke a specific session.

### DELETE `/sessions`
Revoke all sessions except the current one.

---

## CRM — `/api/v1/crm`

### Leads — `/crm/leads`

| Method | Path | Description |
|---|---|---|
| GET | `/crm/leads` | List leads (paginated, filterable) |
| POST | `/crm/leads` | Create a new lead |
| GET | `/crm/leads/:id` | Get lead by ID |
| PATCH | `/crm/leads/:id` | Update lead |
| DELETE | `/crm/leads/:id` | Soft-delete lead |
| PATCH | `/crm/leads/:id/convert` | Convert lead to contact/deal |

**Query params for GET /crm/leads:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` — `NEW | CONTACTED | QUALIFIED | NEGOTIATION | CONVERTED | LOST`
- `assignedToId` — filter by user UUID
- `search` — full-text search on name, email, company
- `sortBy` — field name
- `sortOrder` — `asc | desc`

---

### Contacts — `/crm/contacts`

| Method | Path | Description |
|---|---|---|
| GET | `/crm/contacts` | List contacts |
| POST | `/crm/contacts` | Create contact |
| GET | `/crm/contacts/:id` | Get contact |
| PATCH | `/crm/contacts/:id` | Update contact |
| DELETE | `/crm/contacts/:id` | Soft-delete contact |

---

### Companies — `/crm/companies`

| Method | Path | Description |
|---|---|---|
| GET | `/crm/companies` | List companies |
| POST | `/crm/companies` | Create company |
| GET | `/crm/companies/:id` | Get company with contacts |
| PATCH | `/crm/companies/:id` | Update company |
| DELETE | `/crm/companies/:id` | Soft-delete company |

---

### Deals — `/crm/deals`

| Method | Path | Description |
|---|---|---|
| GET | `/crm/deals` | List deals with pipeline stage |
| POST | `/crm/deals` | Create deal |
| GET | `/crm/deals/:id` | Get deal |
| PATCH | `/crm/deals/:id` | Update deal (incl. stage change) |
| DELETE | `/crm/deals/:id` | Soft-delete deal |
| GET | `/crm/deals/pipeline` | Pipeline view grouped by stage |

---

### Tasks — `/crm/tasks`

| Method | Path | Description |
|---|---|---|
| GET | `/crm/tasks` | List tasks for tenant |
| POST | `/crm/tasks` | Create task |
| GET | `/crm/tasks/:id` | Get task |
| PATCH | `/crm/tasks/:id` | Update task / change status |
| DELETE | `/crm/tasks/:id` | Delete task |

---

## Finance — `/api/v1/finance`

### Invoices — `/finance/invoices`

| Method | Path | Description |
|---|---|---|
| GET | `/finance/invoices` | List invoices |
| POST | `/finance/invoices` | Create invoice |
| GET | `/finance/invoices/:id` | Get invoice |
| PATCH | `/finance/invoices/:id` | Update invoice |
| DELETE | `/finance/invoices/:id` | Delete (draft only) |
| POST | `/finance/invoices/:id/send` | Send invoice by email |
| POST | `/finance/invoices/:id/mark-paid` | Mark as paid |
| GET | `/finance/invoices/:id/pdf` | Generate PDF |

---

## AI — `/api/v1/ai`

### POST `/ai/chat`
Send a message to the AI assistant.

**Body:**
```json
{
  "message": "Quais leads precisam de follow-up esta semana?",
  "context": { "module": "crm", "leadId": "uuid" }
}
```

**Response `200`:**
```json
{
  "reply": "Com base nos dados do CRM...",
  "sources": ["leads", "tasks"],
  "suggestions": ["Agendar ligação com X", "Enviar proposta para Y"]
}
```

---

### GET `/ai/insights`
Get AI-generated insights for the current tenant.

**Query params:**
- `module` — `crm | finance | projects | all`
- `limit` — number of insights (default: 5)

---

### POST `/ai/suggestions/reply`
Get AI-suggested reply for an omnichannel conversation.

**Body:** `{ "conversationId": "uuid" }`

---

## Workflow — `/api/v1/workflow`

### POST `/workflow/automations`
Create a new automation rule.

**Body:**
```json
{
  "name": "Notificar quando lead é convertido",
  "trigger": { "event": "lead.converted", "conditions": {} },
  "actions": [
    { "type": "SEND_EMAIL", "config": { "template": "lead-converted" } },
    { "type": "CREATE_TASK", "config": { "title": "Onboarding {{lead.name}}" } }
  ]
}
```

---

## Pagination Response Format

All list endpoints return:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Error Format

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": ["email must be an email", "password is too weak"],
  "timestamp": "2026-06-18T10:30:00.000Z",
  "path": "/api/v1/auth/register",
  "requestId": "req_abc123"
}
```
