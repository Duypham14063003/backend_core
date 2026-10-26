import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/roles.enum';
import { User } from '../../users/entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ example: '+84901234567', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: 100 })
  points: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-26T00:00:00.000Z' })
  updatedAt: Date;

  public static fromEntity(user: User): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.avatarUrl = user.avatarUrl;
    dto.phoneNumber = user.phoneNumber;
    dto.role = user.role;
    dto.points = user.points;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
