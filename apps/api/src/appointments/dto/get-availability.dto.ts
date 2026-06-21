import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class GetAvailabilityDto {
  @IsNotEmpty()
  @IsUUID()
  businessId: string;

  @IsNotEmpty()
  @IsString()
  serviceIds: string; // Comma separated service IDs, e.g. "uuid1,uuid2"

  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string; // YYYY-MM-DD format
}
