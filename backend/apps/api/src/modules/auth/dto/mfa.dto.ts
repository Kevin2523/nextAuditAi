import { IsString, Matches } from 'class-validator';

export class MfaEnableDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El codigo OTP debe tener 6 digitos.' })
  otp!: string;
}

export class MfaVerifyLoginDto {
  @IsString()
  tempToken!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'El codigo OTP debe tener 6 digitos.' })
  otp!: string;
}

export class PasskeyMfaBeginDto {
  @IsString()
  tempToken!: string;
}

export class PasskeyMfaCompleteDto {
  @IsString()
  sessionId!: string;

  @IsString()
  tempToken!: string;

  @IsString()
  id!: string;

  @IsString()
  rawId!: string;

  response!: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}
