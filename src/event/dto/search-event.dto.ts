import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class SearchEventDto {
  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  date: string;
}
