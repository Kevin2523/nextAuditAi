import { Module } from '@nestjs/common';
import { UserPasswordService } from './services/user-password.service';

@Module({
  providers: [UserPasswordService],
  exports: [UserPasswordService],
})
export class IamModule {}
