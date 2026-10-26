import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GiftsService } from './gifts.service';
import { UserQueryGiftDto } from './dto/user-query-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@ApiTags('Gifts - User Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse available system gifts for users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of available gifts retrieved successfully',
  })
  public async getAvailableGifts(
    @Query() query: UserQueryGiftDto,
  ): Promise<PaginatedResult<GiftResponseDto>> {
    return this.giftsService.findGiftsForUser(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an available gift by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gift details retrieved successfully',
    type: GiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gift not found or inactive',
  })
  public async getGiftDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<GiftResponseDto> {
    return this.giftsService.getGiftDetailForUser(id);
  }
}
