import {
  IsEmail,
  IsISO8601,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  role!: string;

  @IsString()
  fullName!: string;

  @IsISO8601()
  dob!: string;

  @IsString()
  @Matches(/^\d{10,15}$/)
  mobile!: string;

  @IsEmail()
  email!: string;

  @IsString()
  street!: string;

  @IsString()
  city!: string;

  @IsString()
  province!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
