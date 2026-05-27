import { Suspense } from "react";
import Link from "next/link";
import { getArticles, searchArticles } from "@/lib/api";
import { DeleteButton } from "./delete-button";
import { SearchBar } from "./search-bar";

function StatusDot({ status }: { status: string }) {
  if (status === "completed") return null;
  const color = status === "pending" ? "bg-amber-500" : "bg-slate-400";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
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
      <h1 className="text-2xl font-bold text-slate-900">
        {q ? `搜索：${q}` : "文章"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        {q ? `${articles.length} 条结果` : `${articles.length} 篇收藏`}
      </p>
      <Suspense>
        <SearchBar />
      </Suspense>
      {articles.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">
          {q ? "未找到相关文章" : "暂无文章"}
        </p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group relative rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition-shadow hover:shadow-md"
            >
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-base font-semibold leading-snug text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {article.title ?? "无标题"}
                  </Link>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    {article.author && (
                      <>
                        <span className="font-medium text-slate-600">
                          {article.author}
                        </span>
                        <span className="text-slate-300">·</span>
                      </>
                    )}
                    {article.created_at && (
                      <span>
                        {new Date(article.created_at).toLocaleDateString(
                          "zh-CN"
                        )}
                      </span>
                    )}
                    <StatusDot status={article.status} />
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  {article.cover_image && (
                    <img
                      src={article.cover_image}
                      alt=""
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                  )}
                  <DeleteButton articleId={article.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
