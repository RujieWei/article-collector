import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.database import supabase
from app.extractor import extract_wechat_article
from app.parser import parse_wechat_html

router = APIRouter(prefix="/api/v1/articles", tags=["articles"])


class ArticleCreate(BaseModel):
    url: str
    source: str = "wechat"
    title: Optional[str] = None
    author: Optional[str] = None
    html_content: Optional[str] = None


class ArticleResponse(BaseModel):
    id: str
    url: str
    title: Optional[str] = None
    author: Optional[str] = None
    content: Optional[str] = None
    source: str
    status: str
    notes: Optional[str] = None
    published_at: Optional[str] = None
    created_at: Optional[str] = None


async def _process_article(article_id: str, url: str, source: str, html_content: Optional[str] = None):
    import logging
    logger = logging.getLogger(__name__)
    try:
        if source == "wechat":
            if html_content:
                content_md = await parse_wechat_html(html_content, article_id)
                supabase.table("articles").update({
                    "content": content_md,
                    "status": "completed",
                }).eq("id", article_id).execute()
            else:
                result = await extract_wechat_article(url, article_id)
                supabase.table("articles").update({
                    "title": result["title"],
                    "author": result["author"],
                    "content": result["content"],
                    "status": "completed",
                }).eq("id", article_id).execute()
        else:
            supabase.table("articles").update({"status": "failed"}).eq("id", article_id).execute()
            return
        logger.info(f"Article {article_id} processed successfully")
    except Exception as e:
        logger.error(f"Article {article_id} processing failed: {e}", exc_info=True)
        supabase.table("articles").update({"status": "failed"}).eq("id", article_id).execute()


@router.post("", response_model=ArticleResponse)
async def create_article(body: ArticleCreate, background_tasks: BackgroundTasks):
    existing = supabase.table("articles").select("id").eq("url", body.url).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Article already exists")

    article_id = str(uuid.uuid4())
    row = {
        "id": article_id,
        "url": body.url,
        "source": body.source,
        "status": "pending",
    }
    if body.title:
        row["title"] = body.title
    if body.author:
        row["author"] = body.author

    result = supabase.table("articles").insert(row).execute()

    background_tasks.add_task(_process_article, article_id, body.url, body.source, body.html_content)

    return result.data[0]


@router.get("")
async def list_articles(limit: int = 20, offset: int = 0):
    result = (
        supabase.table("articles")
        .select("id, url, title, author, source, status, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.get("/{article_id}")
async def get_article(article_id: str):
    result = supabase.table("articles").select("*").eq("id", article_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return result.data[0]
