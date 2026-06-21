import { IsNotEmpty, IsArray, IsInt, IsString, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleDayItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateScheduleDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDayItemDto)
  schedules: ScheduleDayItemDto[];
}
