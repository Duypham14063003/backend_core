import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGiftDto {
  @ApiProperty({ example: 'GIFT-MUG-001', description: 'Unique code of gift' })
  @IsString()
  @IsNotEmpty({ message: 'Gift code is required' })
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Premium Ceramic Coffee Mug', description: 'Gift title' })
  @IsString()
  @IsNotEmpty({ message: 'Gift title is required' })
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'High quality ceramic mug with heat-resistant handle' })
  @IsString()
  @IsNotEmpty({ message: 'Gift description is required' })
  description: string;

  @ApiProperty({ example: 150, description: 'Points needed to redeem' })
  @IsInt()
  @Min(0, { message: 'Points required must be at least 0' })
  pointsRequired: number;

  @ApiProperty({ example: 50, description: 'Available stock count' })
  @IsInt()
  @Min(0, { message: 'Stock quantity must be at least 0' })
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'https://example.com/mug.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
