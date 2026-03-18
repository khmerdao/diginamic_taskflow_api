import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Category } from 'src/category/entities/category.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Partial<Repository<Task>>>;
  let categoryRepository: jest.Mocked<Partial<Repository<Category>>>;

  const user = { id: 1 } as any;

  beforeEach(async () => {
    taskRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait retourner items + pagination avec les valeurs par défaut', async () => {
      (taskRepository.findAndCount as jest.Mock).mockResolvedValue([[], 0]);

      const result = await service.findAll(user, {});

      expect(taskRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: user.id }),
          take: 20,
          skip: 0,
          order: { created_at: 'DESC' },
          relations: ['category'],
        }),
      );
      expect(result).toEqual({
        items: [],
        pagination: { total: 0, page: 1, limit: 20, total_pages: 0 },
      });
    });

    it('devrait appliquer les filtres fournis', async () => {
      (taskRepository.findAndCount as jest.Mock).mockResolvedValue([[], 10]);

      await service.findAll(user, {
        status: 'todo',
        priority: 'high',
        category_id: 3,
        search: 'rapport',
        due_before: '2026-12-31',
        due_after: '2026-01-01',
        page: 2,
        limit: 5,
        sort_by: 'due_date',
        order: 'ASC',
      });

      expect(taskRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: user.id,
            status: 'todo',
            priority: 'high',
            category_id: 3,
            // title et due_date sont des FindOperator, on vérifie juste la présence
            title: expect.any(Object),
            due_date: expect.any(Object),
          }),
          take: 5,
          skip: 5,
          order: { due_date: 'ASC' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('devrait retourner la tâche si elle existe pour l\'utilisateur', async () => {
      const task = { id: 1, user_id: user.id } as Task;
      (taskRepository.findOne as jest.Mock).mockResolvedValue(task);

      const result = await service.findOne(1, user);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user_id: user.id },
        relations: ['category'],
      });
      expect(result).toBe(task);
    });

    it('devrait lever NotFoundException si introuvable', async () => {
      (taskRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999, user)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('devrait créer une tâche sans catégorie', async () => {
      const dto: any = { title: 'T1' };

      (taskRepository.create as jest.Mock).mockReturnValue({ id: 10, ...dto, user_id: user.id });
      (taskRepository.save as jest.Mock).mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 10 } as any);

      const result = await service.create(dto, user);

      expect(taskRepository.create).toHaveBeenCalledWith({ ...dto, user_id: user.id });
      expect(taskRepository.save).toHaveBeenCalled();
      expect(service.findOne).toHaveBeenCalledWith(10, user);
      expect(result).toEqual({ id: 10 });
    });

    it('devrait refuser une catégorie non possédée (ForbiddenException)', async () => {
      const dto: any = { title: 'T1', category_id: 5 };
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto, user)).rejects.toBeInstanceOf(ForbiddenException);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5, user_id: user.id },
      });
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une tâche', async () => {
      const existing = { id: 7, user_id: user.id, title: 'old' } as any;
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(existing) // findOne dans update
        .mockResolvedValueOnce({ ...existing, title: 'new' }); // findOne après save

      (taskRepository.save as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update(7, { title: 'new' } as any, user);

      expect(taskRepository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'new' }));
      expect(result).toEqual(expect.objectContaining({ title: 'new' }));
    });

    it('devrait refuser une catégorie non possédée (ForbiddenException)', async () => {
      const existing = { id: 7, user_id: user.id, title: 'old' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update(7, { category_id: 99 } as any, user)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('devrait supprimer une tâche', async () => {
      const existing = { id: 2, user_id: user.id } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      (taskRepository.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await service.remove(2, user);

      expect(taskRepository.remove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ message: 'Tâche supprimée.' });
    });
  });

  describe('updateStatus', () => {
    it('devrait mettre à jour le statut', async () => {
      const existing = { id: 3, user_id: user.id, status: 'todo' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      (taskRepository.save as jest.Mock).mockResolvedValue(undefined);

      const result = await service.updateStatus(3, 'done', user);

      expect(taskRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'done' }));
      expect(result.status).toBe('done');
    });
  });
});
