import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IamModule } from '../iam/iam.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  imports: [IamModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService],
  exports: [AuthTokenService, JwtModule],
})
export class AuthModule {}
