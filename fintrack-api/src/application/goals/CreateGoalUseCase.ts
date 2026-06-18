import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { Goal } from '../../domain/entities/Goal';

export class CreateGoalUseCase {
  constructor(private readonly goalRepo: IGoalRepository) {}

  execute(data: {
    name: string;
    target: number;
    current?: number;
    deadline: string;
  }): Goal {
    return this.goalRepo.create(data);
  }
}
