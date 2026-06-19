import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InsightsModule } from './modules/insights/insights.module';
import { ChatModule } from './modules/chat/chat.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InsightsModule,
    ChatModule,
    SuggestionsModule,
    HealthModule,
  ],
})
export class AppModule {}
