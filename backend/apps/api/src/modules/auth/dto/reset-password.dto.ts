import { IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_POLICY_MESSAGE, PASSWORD_POLICY_REGEX } from './login.dto';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(12, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_MESSAGE })
  password!: string;
}
