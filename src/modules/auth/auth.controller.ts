import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('user/register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  public async registerUser(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.authService.registerUser(dto);
  }

  @Public()
  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and obtain JWT token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User login successful',
    type: AuthResponseDto,
  })
  public async loginUser(@Body() dto: UserLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginUser(dto);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate admin and obtain JWT token (Admin role required)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not possess administrator role',
  })
  public async loginAdmin(@Body() dto: AdminLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginAdmin(dto);
  }
}
