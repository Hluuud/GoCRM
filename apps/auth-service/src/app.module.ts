import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: config.get<number>('rateLimit.shortTtl', 1000),
          limit: config.get<number>('rateLimit.shortLimit', 5),
        },
        {
          name: 'long',
          ttl: config.get<number>('rateLimit.longTtl', 60000),
          limit: config.get<number>('rateLimit.longLimit', 100),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    SessionsModule,
    MfaModule,
    HealthModule,
  ],
})
export class AppModule {}
