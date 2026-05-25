"use client";

import { useState, useTransition } from "react";
import { updateNotesAction } from "@/lib/actions";

export function NotesEditor({
  articleId,
  initialNotes,
}: {
  articleId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateNotesAction(articleId, notes);
      setSaved(true);
    });
  }

  return (
    <div>
      <textarea
        className="w-full resize-none border-b border-stone-200 bg-transparent py-2 text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none transition-colors"
        rows={3}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="添加备注..."
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          className="rounded-md border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-50"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        {saved && (
          <span className="text-xs text-stone-400">已保存</span>
        )}
      </div>
    </div>
  );
}
