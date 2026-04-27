import type { Cell } from "./cells";
import type { SubGoal } from "./sub-goals";

export interface Board {
  id: string;
  user_id: string;
  title: string;
  main_goal: string;
  created_at: string;
  updated_at: string;
}

export interface BoardDetail extends Board {
  sub_goals: (SubGoal & {
    cells: Cell[];
  })[];
}

export type CreateBoardPayload = Pick<Board, "title" | "main_goal">;
export type UpdateBoardPayload = Partial<Pick<Board, "title" | "main_goal">>;
