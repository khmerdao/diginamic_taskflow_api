import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';

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

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
