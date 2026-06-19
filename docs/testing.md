# Testing Guide — NexCRM

## Stack

| Layer | Tool |
|---|---|
| Unit tests | Jest + ts-jest |
| E2E tests | Jest + supertest |
| Mocking | jest.fn(), jest.spyOn() |
| Coverage | Istanbul (built-in Jest) |
| CI enforcement | GitHub Actions (coverage >= 70%) |

---

## Running Tests

```bash
# All services (from root)
pnpm test

# Single service
cd apps/auth-service && pnpm test

# With coverage
pnpm test -- --coverage

# Watch mode (development)
pnpm test -- --watch

# E2E only
pnpm test:e2e
```

---

## Unit Test Patterns

### Service test example

```typescript
// apps/crm-service/src/modules/leads/leads.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { LeadsRepository } from './leads.repository';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: jest.Mocked<LeadsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: LeadsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get(LeadsRepository);
  });

  describe('findAll', () => {
    it('should return paginated leads for tenant', async () => {
      const mockLeads = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      repository.findAll.mockResolvedValue(mockLeads);

      const result = await service.findAll('tenant-123', {});
      expect(result).toEqual(mockLeads);
      expect(repository.findAll).toHaveBeenCalledWith('tenant-123', {});
    });
  });
});
```

### Controller test example

```typescript
// apps/auth-service/src/modules/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const mockTokens = { accessToken: 'jwt_token', expiresIn: 900 };
      authService.login.mockResolvedValue(mockTokens as any);

      const result = await controller.login(
        { email: 'user@test.com', password: 'secret123', rememberMe: false },
        { res: {} } as any,
      );

      expect(result).toEqual(mockTokens);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## E2E Test Patterns

```typescript
// apps/auth-service/test/auth.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => await app.close());

  it('POST /auth/register → 201', () =>
    request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@test.com',
        password: 'Test@1234',
        firstName: 'E2E',
        lastName: 'User',
        organizationName: 'Test Org',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('e2e@test.com');
      }));

  it('POST /auth/login → 200', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@test.com', password: 'Test@1234' })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      }));
});
```

---

## Coverage Thresholds

Enforced in CI via `jest --coverage --coverageThreshold`:

| Metric | Minimum |
|---|---|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

---

## Mocking External Dependencies

```typescript
// Mock PrismaService
const mockPrisma = {
  lead: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

// Mock Redis
const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
};
```
