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
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-blue-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        返回
      </Link>

      <article>
        <h1 className="text-3xl font-bold leading-tight text-slate-900">
          {article.title ?? "无标题"}
        </h1>
        <div className="mt-4 flex items-center gap-2.5 text-sm text-slate-500">
          {article.author && (
            <>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                {article.author.charAt(0)}
              </span>
              <span className="font-medium text-slate-700">
                {article.author}
              </span>
              <span className="text-slate-300">·</span>
            </>
          )}
          {article.created_at && (
            <span>
              {new Date(article.created_at).toLocaleDateString("zh-CN")}
            </span>
          )}
        </div>

        <div className="prose prose-slate mt-10 max-w-none prose-headings:font-bold prose-h2:text-xl prose-p:text-base prose-p:leading-[1.8] prose-p:text-slate-700 prose-img:rounded-xl prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg">
          <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-16 border-t border-slate-200 pt-8">
        <h2 className="mb-4 text-base font-semibold text-slate-800">备注</h2>
        <NotesEditor
          articleId={article.id}
          initialNotes={article.notes ?? ""}
        />
      </div>
    </div>
  );
}
