import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export class DeleteTransactionUseCase {
  constructor(private readonly txRepo: ITransactionRepository) {}

  execute(id: string): boolean {
    return this.txRepo.delete(id);
  }
}
