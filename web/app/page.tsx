import Link from "next/link";
import { getArticles } from "@/lib/api";
import { DeleteButton } from "./delete-button";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">文章列表</h1>
      {articles.length === 0 ? (
        <p className="text-gray-500">暂无文章</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between rounded-lg border bg-white px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/articles/${article.id}`}
                    className="truncate font-medium hover:text-blue-600"
                  >
                    {article.title ?? "无标题"}
                  </Link>
                  <StatusBadge status={article.status} />
                </div>
                <div className="mt-1 flex gap-3 text-sm text-gray-500">
                  {article.author && <span>{article.author}</span>}
                  <span>{article.source}</span>
                  {article.created_at && (
                    <span>
                      {new Date(article.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  )}
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
