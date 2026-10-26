import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gift } from './entities/gift.entity';
import { CreateGiftDto } from './dto/create-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { UserQueryGiftDto } from './dto/user-query-gift.dto';
import { AdminQueryGiftDto } from './dto/admin-query-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
  ) {}

  // ===================== USER METHODS =====================

  public async findGiftsForUser(
    query: UserQueryGiftDto,
  ): Promise<PaginatedResult<GiftResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.giftRepository.createQueryBuilder('gift');
    qb.where('gift.is_active = :isActive', { isActive: true });

    if (query.search) {
      qb.andWhere('(LOWER(gift.title) LIKE :search OR LOWER(gift.description) LIKE :search)', {
        search: `%${query.search.toLowerCase().trim()}%`,
      });
    }

    if (query.minPoints !== undefined) {
      qb.andWhere('gift.points_required >= :minPoints', { minPoints: query.minPoints });
    }

    if (query.maxPoints !== undefined) {
      qb.andWhere('gift.points_required <= :maxPoints', { maxPoints: query.maxPoints });
    }

    qb.orderBy('gift.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => GiftResponseDto.fromEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getGiftDetailForUser(id: string): Promise<GiftResponseDto> {
    const gift = await this.giftRepository.findOne({
      where: { id, isActive: true },
    });

    if (!gift) {
      throw new NotFoundException(`Gift with ID ${id} not found or is currently unavailable`);
    }

    return GiftResponseDto.fromEntity(gift);
  }

  // ===================== ADMIN METHODS =====================

  public async createGift(dto: CreateGiftDto): Promise<GiftResponseDto> {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.giftRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Gift code '${code}' is already in use`);
    }

    const gift = this.giftRepository.create({
      code,
      title: dto.title.trim(),
      description: dto.description.trim(),
      pointsRequired: dto.pointsRequired,
      stockQuantity: dto.stockQuantity,
      imageUrl: dto.imageUrl?.trim() || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.giftRepository.save(gift);
    return GiftResponseDto.fromEntity(saved);
  }

  public async findAllGiftsForAdmin(
    query: AdminQueryGiftDto,
  ): Promise<PaginatedResult<GiftResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.giftRepository.createQueryBuilder('gift');

    if (query.isActive !== undefined) {
      qb.andWhere('gift.is_active = :isActive', { isActive: query.isActive });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(gift.code) LIKE :search OR LOWER(gift.title) LIKE :search OR LOWER(gift.description) LIKE :search)',
        { search: `%${query.search.toLowerCase().trim()}%` },
      );
    }

    qb.orderBy('gift.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => GiftResponseDto.fromEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getGiftDetailForAdmin(id: string): Promise<GiftResponseDto> {
    const gift = await this.giftRepository.findOne({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Gift with ID ${id} not found`);
    }
    return GiftResponseDto.fromEntity(gift);
  }

  public async updateGift(id: string, dto: UpdateGiftDto): Promise<GiftResponseDto> {
    const gift = await this.giftRepository.findOne({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Gift with ID ${id} not found`);
    }

    if (dto.code) {
      const code = dto.code.toUpperCase().trim();
      if (code !== gift.code) {
        const conflict = await this.giftRepository.findOne({ where: { code } });
        if (conflict) {
          throw new ConflictException(`Gift code '${code}' is already in use`);
        }
        gift.code = code;
      }
    }

    if (dto.title !== undefined) gift.title = dto.title.trim();
    if (dto.description !== undefined) gift.description = dto.description.trim();
    if (dto.pointsRequired !== undefined) gift.pointsRequired = dto.pointsRequired;
    if (dto.stockQuantity !== undefined) gift.stockQuantity = dto.stockQuantity;
    if (dto.imageUrl !== undefined) gift.imageUrl = dto.imageUrl ? dto.imageUrl.trim() : null;
    if (dto.isActive !== undefined) gift.isActive = dto.isActive;

    const saved = await this.giftRepository.save(gift);
    return GiftResponseDto.fromEntity(saved);
  }

  public async deleteGift(id: string): Promise<{ message: string }> {
    const gift = await this.giftRepository.findOne({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Gift with ID ${id} not found`);
    }

    await this.giftRepository.remove(gift);
    return { message: `Gift with ID ${id} deleted successfully` };
  }
}
