import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TaskController', () => {
  let controller: TaskController;
  let service: jest.Mocked<TaskService>;

  const user = { id: 1 } as any;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<TaskService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create -> appelle TaskService.create', async () => {
    (service.create as jest.Mock).mockResolvedValue({ id: 1 } as any);

    const dto: any = { title: 'T1' };
    const req: any = { user };

    const result = await controller.create(dto, req);

    expect(service.create).toHaveBeenCalledWith(dto, user);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll -> appelle TaskService.findAll', async () => {
    (service.findAll as jest.Mock).mockResolvedValue({ items: [], pagination: {} } as any);

    const req: any = { user };
    const filters: any = { page: 1 };

    await controller.findAll(req, filters);
    expect(service.findAll).toHaveBeenCalledWith(user, filters);
  });
});
