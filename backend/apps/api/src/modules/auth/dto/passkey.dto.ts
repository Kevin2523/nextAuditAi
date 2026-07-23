import { IsEmail, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsObject()
  response!: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
    deviceType?: string;
    backedUp?: boolean;
  };

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  clientExtensionResults?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  authenticatorAttachment?: string;

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

  @IsObject()
  response!: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}
