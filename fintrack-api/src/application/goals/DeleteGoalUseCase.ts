import { IGoalRepository } from '../../domain/repositories/IGoalRepository';

export class DeleteGoalUseCase {
  constructor(private readonly goalRepo: IGoalRepository) {}

  execute(id: string): boolean {
    return this.goalRepo.delete(id);
  }
}
