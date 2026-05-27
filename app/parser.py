from __future__ import annotations

import re

from bs4 import BeautifulSoup, NavigableString

from app.storage import upload_image


async def parse_wechat_html(html_content: str, article_id: str) -> dict:
    soup = BeautifulSoup(html_content, "html.parser")

    cover_image = ""
    og_meta = soup.find("meta", property="og:image")
    if og_meta and og_meta.get("content"):
        uploaded = await upload_image(article_id, og_meta["content"])
        cover_image = uploaded or og_meta["content"]

    for img in soup.find_all("img"):
        src = img.get("data-src") or img.get("src")
        if not src:
            img.decompose()
            continue
        public_url = await upload_image(article_id, src)
        new_url = public_url or src
        img.replace_with(NavigableString(f"\n![image]({new_url})\n"))

    for tag in soup.find_all(re.compile(r"^h[1-6]$")):
        text = tag.get_text().strip()
        tag.replace_with(NavigableString(f"\n## {text}\n"))

    for tag in soup.find_all(["strong", "b"]):
        text = tag.get_text()
        tag.replace_with(NavigableString(f"**{text}**"))

    for tag in soup.find_all(["p", "section", "blockquote"]):
        tag.insert_before(NavigableString("\n\n"))
        tag.insert_after(NavigableString("\n\n"))

    content = soup.get_text()
    content = re.sub(r"\n{3,}", "\n\n", content).strip()

    return {"content": content, "cover_image": cover_image}
