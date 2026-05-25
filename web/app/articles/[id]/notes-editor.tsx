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
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "保存中..." : "保存"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600">已保存</span>
        )}
      </div>
    </div>
  );
}
