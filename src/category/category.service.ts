import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(user: User) {
    const categories = await this.categoryRepository.find({
      where: { user_id: user.id},
    });

    return categories;
  }

  async findOne(id: number, user: User) {
    const category = await this.categoryRepository.findOne({
      where: { id: id, user_id: user.id},
    });
    if (!category) throw new NotFoundException('Catégorie not found.');

    return category;
  }

  async create(dto: CreateCategoryDto, user: User) {
    try {
      const category = await this.categoryRepository.create({
        ...dto,
        user_id: user.id,
      });
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Vous avez déjà une catégorie avec ce nom.');
      }
      throw error;
    }
  }

  async update(id: number, user: User, dto: UpdateCategoryDto) {
    const category = await this.findOne(id, user);
    if (!category) throw new NotFoundException('Catégorie not found.');

    try {
      Object.assign(category, dto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Vous avez déjà une catégorie avec ce nom.');
      }
      throw error;
    }
  }

  async remove(id: number, user: User) {
    const category = await this.findOne(id, user);

    await this.categoryRepository.remove(category);

    return { message: 'Catégorie supprimée. Les tâches associées ont été dissociées.' };
  }
}
