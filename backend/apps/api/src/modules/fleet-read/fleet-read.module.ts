import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FleetReadController } from './fleet-read.controller';
import { FleetReadService } from './services/fleet-read.service';

@Module({
  imports: [AuthModule],
  controllers: [FleetReadController],
  providers: [FleetReadService],
})
export class FleetReadModule {}
