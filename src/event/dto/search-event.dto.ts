import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchEventDto {
  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  date: string;
}
