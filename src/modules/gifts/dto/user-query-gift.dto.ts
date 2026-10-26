import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class UserQueryGiftDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for gift title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter gifts with minimum points' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({ description: 'Filter gifts with maximum points' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPoints?: number;
}
