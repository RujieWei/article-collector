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
        className="w-full rounded-lg border px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        rows={4}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="添加备注..."
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "保存中..." : "保存备注"}
        </button>
        {saved && <span className="text-sm text-green-600">已保存</span>}
      </div>
    </div>
  );
}
