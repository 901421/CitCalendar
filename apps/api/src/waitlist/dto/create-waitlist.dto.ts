import { IsNotEmpty, IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateWaitlistDto {
  @IsNotEmpty()
  @IsUUID()
  businessId: string;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  clientPhone: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsNotEmpty()
  @IsString()
  requestedDate: string; // YYYY-MM-DD

  @IsNotEmpty()
  @IsString()
  preferredStart: string; // HH:MM

  @IsNotEmpty()
  @IsString()
  preferredEnd: string; // HH:MM

  @IsOptional()
  @IsUUID()
  professionalId?: string;
}
