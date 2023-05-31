import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateUpdateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  eventName: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  location: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  hour: string;

  @ApiProperty()
  @IsNumber()
  maxUsers: number;

  @ApiProperty()
  @IsString()
  description: string;
}
