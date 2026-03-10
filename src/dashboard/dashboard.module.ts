import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Category])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
