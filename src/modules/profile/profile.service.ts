import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  public async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return UserProfileResponseDto.fromEntity(user);
  }

  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.usersService.update(userId, {
      fullName: dto.fullName !== undefined ? dto.fullName.trim() : user.fullName,
      avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl.trim() : user.avatarUrl,
      phoneNumber: dto.phoneNumber !== undefined ? dto.phoneNumber.trim() : user.phoneNumber,
    });

    return UserProfileResponseDto.fromEntity(updatedUser);
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userWithPassword = await this.usersService.findByEmail(user.email, true);
    if (!userWithPassword) {
      throw new NotFoundException('User credentials not found');
    }

    const isMatch = await this.authService.comparePasswords(
      dto.oldPassword,
      userWithPassword.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const newHashed = await this.authService.hashPassword(dto.newPassword);
    await this.usersService.updatePassword(userId, newHashed);

    return { message: 'Password changed successfully' };
  }
}
