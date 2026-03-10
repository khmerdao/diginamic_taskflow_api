import { Category } from 'src/category/entities/category.entity';
import { Task } from 'src/task/entities/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Category, (category) => category.user, { cascade: true })
  categories: Category[];

  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks: Task[];
}