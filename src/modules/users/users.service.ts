import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { USER_MESSAGES } from '../../common/constants/messages.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findById(id: string, includePassword = false): Promise<User | null> {
    if (!includePassword) {
      return this.userRepository.findOne({ where: { id } });
    }
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .getOne();
  }

  public async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const qb = this.userRepository.createQueryBuilder('user').where('user.email = :email', {
      email: email.toLowerCase().trim(),
    });

    if (includePassword) {
      qb.addSelect('user.password');
    }

    return qb.getOne();
  }

  public async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  public async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  public async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userRepository.update(id, { password: hashedPassword });
    if (result.affected === 0) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }
  }

  public async count(): Promise<number> {
    return this.userRepository.count();
  }
}
