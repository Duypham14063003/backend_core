import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  public async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userRepository.update(id, { password: hashedPassword });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  public async count(): Promise<number> {
    return this.userRepository.count();
  }
}
