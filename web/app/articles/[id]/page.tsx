import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getArticle } from "@/lib/api";
import { NotesEditor } from "./notes-editor";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; 返回列表
      </Link>

      <article>
        <h1 className="text-2xl font-bold">{article.title ?? "无标题"}</h1>
        <div className="mt-2 flex gap-3 text-sm text-gray-500">
          {article.author && <span>{article.author}</span>}
          <span>{article.source}</span>
          {article.created_at && (
            <span>
              {new Date(article.created_at).toLocaleDateString("zh-CN")}
            </span>
          )}
        </div>

        <div className="prose prose-gray mt-8 max-w-none">
          <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-12 border-t pt-8">
        <h2 className="mb-3 text-lg font-semibold">备注</h2>
        <NotesEditor articleId={article.id} initialNotes={article.notes ?? ""} />
      </div>
    </div>
  );
}
