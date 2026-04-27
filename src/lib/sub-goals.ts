import { SubGoal, UpdateSubGoalPayload } from "@/types/sub-goals";
import { supabase } from "./supabase";

export async function updateSubGoal(
  id: string,
  payload: UpdateSubGoalPayload,
): Promise<SubGoal> {
  const { data, error } = await supabase
    .from("sub_goals")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
