import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IamModule } from '../iam/iam.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';

@Module({
  imports: [AuthModule, IamModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
