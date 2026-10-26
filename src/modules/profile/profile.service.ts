import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { USER_MESSAGES } from '../../common/constants/messages.constant';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  public async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }
    return UserProfileResponseDto.fromEntity(user);
  }

  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
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
    // Single query selecting password by ID - avoids redundant double-fetch
    const user = await this.usersService.findById(userId, true);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }

    const isMatch = await this.authService.comparePasswords(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException(USER_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(USER_MESSAGES.NEW_PASSWORD_SAME_AS_OLD);
    }

    const newHashed = await this.authService.hashPassword(dto.newPassword);
    await this.usersService.updatePassword(userId, newHashed);

    return { message: USER_MESSAGES.PASSWORD_CHANGED_SUCCESS };
  }
}
