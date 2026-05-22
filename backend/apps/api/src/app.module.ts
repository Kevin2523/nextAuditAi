import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './persistence/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { IamModule } from './modules/iam/iam.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { LlmGovernanceModule } from './modules/llm-governance/llm-governance.module';
import { FleetReadModule } from './modules/fleet-read/fleet-read.module';
import { ActivityModule } from './modules/activity/activity.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    IamModule,
    TenantsModule,
    AlertsModule,
    AiChatModule,
    AdminUsersModule,
    LlmGovernanceModule,
    FleetReadModule,
    ActivityModule,
    WebhooksModule,
    HealthModule,
  ],
})
export class AppModule {}
