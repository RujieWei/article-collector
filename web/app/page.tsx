import { Suspense } from "react";
import Link from "next/link";
import { getArticles, searchArticles } from "@/lib/api";
import { DeleteButton } from "./delete-button";
import { SearchBar } from "./search-bar";

function StatusDot({ status }: { status: string }) {
  if (status === "completed") return null;
  const color =
    status === "pending" ? "bg-amber-400" : "bg-stone-300";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      {status}
    </span>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const articles = q ? await searchArticles(q) : await getArticles();

  return (
    <div>
      <h1 className="mb-1 text-xl font-medium text-stone-900">
        {q ? `搜索：${q}` : "文章"}
      </h1>
      <p className="mb-6 text-sm text-stone-400">
        {q
          ? `${articles.length} 条结果`
          : `${articles.length} 篇收藏`}
      </p>
      <Suspense>
        <SearchBar />
      </Suspense>
      {articles.length === 0 ? (
        <p className="py-12 text-center text-sm text-stone-400">
          {q ? "未找到相关文章" : "暂无文章"}
        </p>
      ) : (
        <div className="divide-y divide-stone-200/60">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group flex items-start justify-between py-5"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/articles/${article.id}`}
                  className="text-[15px] font-normal text-stone-800 group-hover:text-stone-600 transition-colors"
                >
                  {article.title ?? "无标题"}
                </Link>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-400">
                  {article.author && (
                    <>
                      <span>{article.author}</span>
                      <span className="text-stone-300">·</span>
                    </>
                  )}
                  {article.created_at && (
                    <span>
                      {new Date(article.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                  <StatusDot status={article.status} />
                </div>
              </div>
              <DeleteButton articleId={article.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
