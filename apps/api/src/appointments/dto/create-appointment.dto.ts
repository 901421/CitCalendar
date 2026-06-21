import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString, IsEmail, IsArray } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  businessId: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID(undefined, { each: true })
  serviceIds: string[];

  @IsNotEmpty()
  @IsString()
  professionalId: string; // Can be a professional UUID or "any"

  @IsNotEmpty()
  @IsDateString()
  startTime: string; // ISO 8601 string format (e.g. 2026-06-21T09:00:00.000Z)

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  clientPhone: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
