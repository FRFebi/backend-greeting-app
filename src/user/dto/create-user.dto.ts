import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @IsNotEmpty()
  @IsDateString()
  readonly dob: string;

  @IsNotEmpty()
  @IsInt()
  readonly timezone: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  readonly email: string;
}
