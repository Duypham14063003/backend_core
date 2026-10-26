import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { AdminQueryGiftDto } from './dto/admin-query-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.enum';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@ApiTags('Admin - Gifts Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/v1/admin/gifts')
export class AdminGiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gift (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Gift created successfully',
    type: GiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Gift code already exists',
  })
  public async createGift(@Body() dto: CreateGiftDto): Promise<GiftResponseDto> {
    return this.giftsService.createGift(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all system gifts with filters (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System gifts retrieved successfully',
  })
  public async getAllGifts(
    @Query() query: AdminQueryGiftDto,
  ): Promise<PaginatedResult<GiftResponseDto>> {
    return this.giftsService.findAllGiftsForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single gift details by ID (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gift details retrieved successfully',
    type: GiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gift not found',
  })
  public async getGiftById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<GiftResponseDto> {
    return this.giftsService.getGiftDetailForAdmin(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing gift by ID (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gift updated successfully',
    type: GiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gift not found',
  })
  public async updateGift(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateGiftDto,
  ): Promise<GiftResponseDto> {
    return this.giftsService.updateGift(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a gift by ID (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gift deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gift not found',
  })
  public async deleteGift(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.giftsService.deleteGift(id);
  }
}
