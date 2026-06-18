import { IGoalRepository } from '../../domain/repositories/IGoalRepository';

export class BulkDeleteGoalsUseCase {
  constructor(private readonly goalRepo: IGoalRepository) {}

  execute(ids: string[]): { deletedCount: number } {
    const result = this.goalRepo.bulkDelete(ids);
    return { deletedCount: result.deleted };
  }
}
