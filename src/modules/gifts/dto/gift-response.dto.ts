import { ApiProperty } from '@nestjs/swagger';
import { Gift } from '../entities/gift.entity';

export class GiftResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id: string;

  @ApiProperty({ example: 'GIFT-MUG-001' })
  code: string;

  @ApiProperty({ example: 'Premium Ceramic Coffee Mug' })
  title: string;

  @ApiProperty({ example: 'High quality ceramic mug with heat-resistant handle' })
  description: string;

  @ApiProperty({ example: 150 })
  pointsRequired: number;

  @ApiProperty({ example: 50 })
  stockQuantity: number;

  @ApiProperty({ example: 'https://example.com/mug.png', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-26T00:00:00.000Z' })
  updatedAt: Date;

  public static fromEntity(gift: Gift): GiftResponseDto {
    const dto = new GiftResponseDto();
    dto.id = gift.id;
    dto.code = gift.code;
    dto.title = gift.title;
    dto.description = gift.description;
    dto.pointsRequired = gift.pointsRequired;
    dto.stockQuantity = gift.stockQuantity;
    dto.imageUrl = gift.imageUrl;
    dto.isActive = gift.isActive;
    dto.createdAt = gift.createdAt;
    dto.updatedAt = gift.updatedAt;
    return dto;
  }
}
