"use client";

import { useTransition } from "react";
import { deleteArticleAction } from "@/lib/actions";

export function DeleteButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="ml-4 shrink-0 rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (!confirm("确定要删除这篇文章吗？")) return;
        startTransition(() => deleteArticleAction(articleId));
      }}
    >
      {isPending ? "删除中..." : "删除"}
    </button>
  );
}
