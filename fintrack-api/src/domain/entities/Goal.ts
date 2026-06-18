export enum GoalStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export class Goal {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly target: number,
    public readonly current: number,
    public readonly deadline: string,
    public readonly created_at: string | null
  ) {}

  get progressPct(): number {
    return this.target > 0 ? (this.current / this.target) * 100 : 0;
  }

  get remaining(): number {
    return Math.max(0, this.target - this.current);
  }

  get isCompleted(): boolean {
    return this.current >= this.target;
  }

  get status(): GoalStatus {
    if (this.isCompleted) return GoalStatus.COMPLETED;
    if (this.deadline < this._todayISO()) return GoalStatus.OVERDUE;
    return GoalStatus.IN_PROGRESS;
  }

  private _todayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  static fromRow(row: Record<string, unknown>): Goal {
    return new Goal(
      row.id as string,
      row.name as string,
      Number(row.target),
      Number(row.current),
      row.deadline as string,
      (row.created_at as string) ?? null
    );
  }
}
