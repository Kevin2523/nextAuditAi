import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { MfaEnableDto, MfaVerifyLoginDto } from './dto/mfa.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('mfa/generate')
  @UseGuards(JwtAuthGuard)
  generateMfa(@CurrentUser() user: CurrentUser) {
    return this.authService.generateMfa(user.sub);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  enableMfa(@CurrentUser() user: CurrentUser, @Body() body: MfaEnableDto) {
    return this.authService.enableMfa(user.sub, body);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  disableMfa(@CurrentUser() user: CurrentUser) {
    return this.authService.disableMfa(user.sub);
  }

  @Post('login/mfa-verify')
  verifyMfaLogin(@Body() body: MfaVerifyLoginDto) {
    return this.authService.verifyMfaLogin(body);
  }
}
