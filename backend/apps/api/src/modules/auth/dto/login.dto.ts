import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export const PASSWORD_POLICY_MESSAGE =
  'La contrasena debe tener minimo 12 caracteres, una mayuscula, una minuscula, un numero y un simbolo especial.';

export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
