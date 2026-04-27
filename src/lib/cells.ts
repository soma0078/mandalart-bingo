import { Cell, UpdateCellPayload } from "@/types/cells";
import { supabase } from "./supabase";

// is_completed 변경 시 completed_at 자동 처리
export async function updateCell(
  id: string,
  payload: UpdateCellPayload,
): Promise<Cell> {
  const body =
    payload.is_completed !== undefined
      ? {
          ...payload,
          completed_at: payload.is_completed ? new Date().toISOString() : null,
        }
      : payload;

  const { data, error } = await supabase
    .from("cells")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCell(cell: Cell) {
  return updateCell(cell.id, { is_completed: !cell.is_completed });
}
