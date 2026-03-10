import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Task } from 'src/task/entities/task.entity';

config(); // charge le .env

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Category, Task],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});