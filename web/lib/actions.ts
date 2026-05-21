"use server";

import { revalidatePath } from "next/cache";
import { deleteArticle, updateNotes } from "./api";

export async function deleteArticleAction(id: string) {
  await deleteArticle(id);
  revalidatePath("/");
}

export async function updateNotesAction(id: string, notes: string) {
  await updateNotes(id, notes);
  revalidatePath(`/articles/${id}`);
}
