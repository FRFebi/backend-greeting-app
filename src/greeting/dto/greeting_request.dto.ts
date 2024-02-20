import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GreetingRequestDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
