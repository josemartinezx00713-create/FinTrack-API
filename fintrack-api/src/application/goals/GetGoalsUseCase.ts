import { IGoalRepository } from '../../domain/repositories/IGoalRepository';

export class GetGoalsUseCase {
  constructor(private readonly goalRepo: IGoalRepository) {}

  execute() {
    return this.goalRepo.getAll();
  }
}
