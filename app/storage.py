from __future__ import annotations

import hashlib
import httpx
from app.config import settings
from app.database import supabase

BUCKET_NAME = "article-images"


async def upload_image(article_id: str, image_url: str) -> str | None:
    headers = {"Referer": "https://mp.weixin.qq.com/"}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(image_url, headers=headers)
            resp.raise_for_status()
            image_data = resp.content
    except httpx.HTTPError:
        return None

    content_type = resp.headers.get("content-type", "image/png")
    ext = content_type.split("/")[-1].split(";")[0]
    if ext not in ("png", "jpeg", "jpg", "gif", "webp", "svg+xml"):
        ext = "png"
    ext = ext.replace("svg+xml", "svg")

    file_hash = hashlib.md5(image_data).hexdigest()[:12]
    path = f"{article_id}/{file_hash}.{ext}"

    supabase.storage.from_(BUCKET_NAME).upload(
        path,
        image_data,
        {"content-type": content_type, "upsert": "true"},
    )

    public_url = f"{settings.supabase_url}/storage/v1/object/public/{BUCKET_NAME}/{path}"
    return public_url
