import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString, IsInt, Length } from 'class-validator';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Faire le rapport Q3' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({ example: 'Inclure les métriques de ventes', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  category_id?: number;
}