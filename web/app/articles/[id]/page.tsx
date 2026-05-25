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
        className="mb-8 inline-flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        返回
      </Link>

      <article>
        <h1 className="text-2xl font-medium leading-snug text-stone-900">
          {article.title ?? "无标题"}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
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
        </div>

        <div className="prose prose-stone prose-sm mt-10 max-w-none prose-headings:font-medium prose-p:leading-relaxed prose-img:rounded-lg">
          <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-16 border-t border-stone-200/60 pt-8">
        <h2 className="mb-3 text-sm font-medium text-stone-500">备注</h2>
        <NotesEditor articleId={article.id} initialNotes={article.notes ?? ""} />
      </div>
    </div>
  );
}
