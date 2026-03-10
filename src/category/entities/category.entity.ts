import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';

@Entity('categories')
@Unique(['name', 'user_id'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 7, default: '#6366f1' })
  color: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[];
}