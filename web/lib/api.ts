const API_BASE = process.env.API_BASE_URL!;
const API_KEY = process.env.API_KEY!;

function headers() {
  return {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  };
}

export type Article = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  content: string | null;
  source: string;
  status: string;
  cover_image: string | null;
  notes: string | null;
  published_at: string | null;
  created_at: string | null;
};

export async function getArticles(
  limit = 20,
  offset = 0
): Promise<Article[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/articles?limit=${limit}&offset=${offset}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
}

export async function getArticle(id: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/api/v1/articles/${id}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export async function searchArticles(
  q: string,
  limit = 10
): Promise<Article[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/articles/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to search articles");
  return res.json();
}

export async function deleteArticle(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/articles/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to delete article");
}

export async function updateNotes(
  id: string,
  notes: string
): Promise<Article> {
  const res = await fetch(`${API_BASE}/api/v1/articles/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to update notes");
  return res.json();
}
