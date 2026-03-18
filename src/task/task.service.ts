import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';

export interface TaskFilters {
  status?: string;
  priority?: string;
  category_id?: number;
  search?: string;
  due_before?: string;
  due_after?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(user: User, filters: TaskFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const sortBy = filters.sort_by || 'created_at';
    const order = filters.order || 'DESC';

    // Construction du WHERE
    const where: any = { user_id: user.id };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.search) where.title = Like(`%${filters.search}%`);
    if (filters.due_before && filters.due_after) {
      where.due_date = Between(filters.due_after, filters.due_before);
    } else if (filters.due_before) {
      where.due_date = LessThanOrEqual(filters.due_before);
    } else if (filters.due_after) {
      where.due_date = MoreThanOrEqual(filters.due_after);
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where,
      relations: ['category'],
      order: { [sortBy]: order },
      take: limit,
      skip: offset,
    });

    return {
      items: tasks,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id, user_id: user.id },
      relations: ['category'],
    });
    if (!task) throw new NotFoundException('Tâche introuvable.');
    return task;
  }

  async create(dto: CreateTaskDto, user: User) {
    // Vérifier que la catégorie appartient à l'utilisateur
    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.category_id, user_id: user.id },
      });
      if (!category) throw new ForbiddenException('Catégorie invalide ou non autorisée.');
    }

    const task = this.taskRepository.create({ ...dto, user_id: user.id });
    await this.taskRepository.save(task);

    return this.findOne(task.id, user);
  }

  async update(id: number, dto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user);

    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.category_id, user_id: user.id },
      });
      if (!category) throw new ForbiddenException('Catégorie invalide ou non autorisée.');
    }

    Object.assign(task, dto);
    await this.taskRepository.save(task);

    return this.findOne(id, user);
  }

  async remove(id: number, user: User) {
    const task = await this.findOne(id, user);
    await this.taskRepository.remove(task);
    return { message: 'Tâche supprimée.' };
  }

  async updateStatus(id: number, status: string, user: User) {
    const task = await this.findOne(id, user);
    task.status = status as any;
    await this.taskRepository.save(task);
    return task;
  }
}
