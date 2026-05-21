import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AiChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

export class AiRemediationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  context!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;
}

export class AiReportDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  topic!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;
}
