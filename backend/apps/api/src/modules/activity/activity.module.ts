import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ActivityController } from './activity.controller';
import { N8nActivityService } from './services/n8n-activity.service';

@Module({
  imports: [AuthModule],
  controllers: [ActivityController],
  providers: [N8nActivityService],
})
export class ActivityModule {}
