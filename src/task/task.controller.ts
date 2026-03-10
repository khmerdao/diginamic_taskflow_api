import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { IsEnum } from 'class-validator';
import { TaskStatus } from './entities/task.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

class UpdateStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tâche' })
  create(@Body() dto: CreateTaskDto, @Request() req) {
    return this.taskService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tâches avec filtres' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Request() req, @Query() filters: any) {
    return this.taskService.findAll(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une tâche' })
  findOne(@Param('id') id: number, @Request() req) {
    return this.taskService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tâche' })
  update(@Param('id') id: number, @Body() dto: UpdateTaskDto, @Request() req) {
    return this.taskService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  remove(@Param('id') id: number, @Request() req) {
    return this.taskService.remove(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une tâche' })
  updateStatus(@Param('id') id: number, @Body() dto: UpdateStatusDto, @Request() req) {
    return this.taskService.updateStatus(id, dto.status, req.user);
  }
}
