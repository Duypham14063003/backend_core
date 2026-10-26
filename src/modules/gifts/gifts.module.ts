import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gift } from './entities/gift.entity';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';
import { AdminGiftsController } from './admin-gifts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gift]), UsersModule],
  controllers: [GiftsController, AdminGiftsController],
  providers: [GiftsService],
  exports: [GiftsService, TypeOrmModule],
})
export class GiftsModule {}
