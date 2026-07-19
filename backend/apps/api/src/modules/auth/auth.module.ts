import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IamModule } from '../iam/iam.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordResetMailService } from './services/password-reset-mail.service';
import { PasskeyService } from './services/passkey.service';

@Module({
  imports: [IamModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService, PasswordResetMailService, PasskeyService],
  exports: [AuthTokenService, JwtModule, PasskeyService],
})
export class AuthModule {}
