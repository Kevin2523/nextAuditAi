import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PasskeyRegisterBeginDto {
  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsOptional()
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

export class PasskeyRegisterCompleteDto {
  @IsString()
  sessionId!: string;

  @IsString()
  id!: string;

  @IsString()
  rawId!: string;

  response!: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
    deviceType?: string;
    backedUp?: boolean;
  };

  @IsString()
  @IsOptional()
  deviceName?: string;
}

export class PasskeyLoginBeginDto {
  @IsEmail()
  email!: string;
}

export class PasskeyLoginCompleteDto {
  @IsString()
  sessionId!: string;

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
