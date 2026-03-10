import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository, LessThan, Between, Not, In } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getDashboard(user: User) {
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const DONE_CANCELLED = In(['done', 'cancelled']);

    // ── Total des tâches ──────────────────────────────────────────────────────
    const total = await this.taskRepository.count({
      where: { user_id: user.id },
    });

    // ── Tâches par statut ─────────────────────────────────────────────────────
    const [todo, in_progress, done, cancelled] = await Promise.all([
      this.taskRepository.count({ where: { user_id: user.id, status: 'todo' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, status: 'in_progress' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, status: 'done' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, status: 'cancelled' as any } }),
    ]);

    // ── Tâches par priorité ───────────────────────────────────────────────────
    const [low, medium, high, urgent] = await Promise.all([
      this.taskRepository.count({ where: { user_id: user.id, priority: 'low' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, priority: 'medium' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, priority: 'high' as any } }),
      this.taskRepository.count({ where: { user_id: user.id, priority: 'urgent' as any } }),
    ]);

    // ── Tâches en retard ──────────────────────────────────────────────────────
    const overdue = await this.taskRepository.count({
      where: {
        user_id: user.id,
        due_date: LessThan(today) as any,
        status: Not(DONE_CANCELLED) as any,
      },
    });

    // ── Tâches dues aujourd'hui ───────────────────────────────────────────────
    const due_today = await this.taskRepository.count({
      where: {
        user_id: user.id,
        due_date: today as any,
        status: Not(DONE_CANCELLED) as any,
      },
    });

    // ── Tâches dues cette semaine ─────────────────────────────────────────────
    const due_this_week = await this.taskRepository.count({
      where: {
        user_id: user.id,
        due_date: Between(today, weekEndStr) as any,
        status: Not(DONE_CANCELLED) as any,
      },
    });

    // ── Tâches par catégorie ──────────────────────────────────────────────────
    const categories = await this.categoryRepository.find({
      where: { user_id: user.id },
      relations: ['tasks'],
    });

    const by_category = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      count: cat.tasks.length,
    }));

    // ── Tâches récentes ───────────────────────────────────────────────────────
    const recent_tasks = await this.taskRepository.find({
      where: { user_id: user.id },
      relations: ['category'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    // ── Tâches urgentes non terminées ─────────────────────────────────────────
    const urgent_tasks = await this.taskRepository.find({
      where: {
        user_id: user.id,
        priority: 'urgent' as any,
        status: Not(DONE_CANCELLED) as any,
      },
      relations: ['category'],
      order: { due_date: 'ASC' },
      take: 5,
    });

    // ── Taux de complétion ────────────────────────────────────────────────────
    const completion_rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      summary: {
        total,
        completion_rate,
        overdue,
        due_today,
        due_this_week,
      },
      by_status: { todo, in_progress, done, cancelled },
      by_priority: { low, medium, high, urgent },
      by_category,
      recent_tasks,
      urgent_tasks,
    };
  }
}
