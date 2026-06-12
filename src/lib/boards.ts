import {
  Board,
  BoardDetail,
  CreateBoardPayload,
  UpdateBoardPayload,
} from "@/types/boards";
import type { TemplateSubGoal } from "@/constants/templates";
import { supabase } from "./supabase";

export async function getBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBoardById(id: string): Promise<BoardDetail> {
  const { data, error } = await supabase
    .from("boards")
    .select(
      `
      *,
      sub_goals (
        *,
        cells (*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// 보드 생성 시 서브 목표 8개 + 셀 64개를 순차적으로 초기화
// 중간 단계 실패 시 이전 데이터가 남으므로 주의
export async function createBoard(
  payload: CreateBoardPayload,
  templateSubGoals?: TemplateSubGoal[],
): Promise<Board> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (boardError) throw boardError;

  const subGoals = Array.from({ length: 8 }, (_, i) => ({
    board_id: board.id,
    position: i,
    title: templateSubGoals?.[i]?.title ?? "",
  }));

  const { data: insertedSubGoals, error: subGoalError } = await supabase
    .from("sub_goals")
    .insert(subGoals)
    .select();

  if (subGoalError) throw subGoalError;

  const cells = insertedSubGoals.flatMap((subGoal, sgIdx) =>
    Array.from({ length: 8 }, (_, i) => ({
      sub_goal_id: subGoal.id,
      position: i,
      text: templateSubGoals?.[sgIdx]?.actions?.[i] ?? "",
      is_completed: false,
    })),
  );

  const { error: cellError } = await supabase.from("cells").insert(cells);

  if (cellError) throw cellError;

  return board;
}

export async function updateBoard(
  id: string,
  payload: UpdateBoardPayload,
): Promise<Board> {
  const { data, error } = await supabase
    .from("boards")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// cascade 설정으로 연관된 sub_goals, cells 함께 삭제됨
export async function deleteBoard(id: string) {
  const { error } = await supabase.from("boards").delete().eq("id", id);

  if (error) throw error;
}
