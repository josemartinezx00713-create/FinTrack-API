import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { Goal } from '../../domain/entities/Goal';

export class DepositToGoalUseCase {
  constructor(private readonly goalRepo: IGoalRepository) {}

  execute(id: string, amount: number): Goal | undefined {
    return this.goalRepo.deposit(id, amount);
  }
}
