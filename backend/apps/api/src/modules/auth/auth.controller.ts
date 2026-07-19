import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { MfaEnableDto, MfaVerifyLoginDto, PasskeyMfaBeginDto, PasskeyMfaCompleteDto } from './dto/mfa.dto';
import {
  PasskeyRegisterBeginDto,
  PasskeyRegisterCompleteDto,
  PasskeyLoginBeginDto,
  PasskeyLoginCompleteDto,
} from './dto/passkey.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from './services/auth.service';
import { PasskeyService } from './services/passkey.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passkeyService: PasskeyService,
  ) {}

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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: CurrentUser, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(user.sub, body);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: CurrentUser, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, body);
  }

  @Post('passkey/register/begin')
  @UseGuards(JwtAuthGuard)
  passkeyRegisterBegin(@CurrentUser() user: CurrentUser, @Body() body: PasskeyRegisterBeginDto) {
    return this.passkeyService.generateRegistrationOptions(user.sub, body.deviceName, body.authenticatorAttachment);
  }

  @Post('passkey/register/complete')
  @UseGuards(JwtAuthGuard)
  passkeyRegisterComplete(@CurrentUser() user: CurrentUser, @Body() body: PasskeyRegisterCompleteDto) {
    return this.passkeyService.verifyRegistration(user.sub, body);
  }

  @Post('passkey/login/begin')
  passkeyLoginBegin(@Body() body: PasskeyLoginBeginDto) {
    return this.passkeyService.generateLoginOptions(body.email);
  }

  @Post('passkey/login/complete')
  passkeyLoginComplete(@Body() body: PasskeyLoginCompleteDto) {
    return this.passkeyService.verifyLogin(body);
  }

  @Post('login/mfa-passkey-begin')
  mfaPasskeyBegin(@Body() body: PasskeyMfaBeginDto) {
    return this.passkeyService.generateMfaLoginOptions(body.tempToken);
  }

  @Post('login/mfa-passkey-complete')
  mfaPasskeyComplete(@Body() body: PasskeyMfaCompleteDto) {
    return this.passkeyService.verifyMfaLogin(body);
  }

  @Get('passkey')
  @UseGuards(JwtAuthGuard)
  listPasskeys(@CurrentUser() user: CurrentUser) {
    return this.passkeyService.listPasskeys(user.sub);
  }

  @Delete('passkey/:id')
  @UseGuards(JwtAuthGuard)
  deletePasskey(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.passkeyService.deletePasskey(id, user.sub);
  }
}
