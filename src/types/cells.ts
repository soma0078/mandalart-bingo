export interface Cell {
  id: string;
  sub_goal_id: string;
  position: number;
  text: string;
  is_completed: boolean;
  completed_at: string | null;
}

export type UpdateCellPayload = Partial<Pick<Cell, "text" | "is_completed">>;
