import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Category, Task],
        synchronize: false, // ← migrations uniquement
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        logging: config.get('NODE_ENV') === 'dev',
      }),
    })
  ],
})
export class DatabaseModule {}