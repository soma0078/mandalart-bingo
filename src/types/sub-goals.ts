export interface SubGoal {
  id: string;
  board_id: string;
  position: number;
  title: string;
}

export type UpdateSubGoalPayload = Pick<SubGoal, "title">;
