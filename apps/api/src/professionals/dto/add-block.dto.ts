import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class AddBlockDto {
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
