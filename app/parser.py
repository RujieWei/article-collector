from __future__ import annotations

import re

from bs4 import BeautifulSoup, NavigableString

from app.storage import upload_image


async def parse_wechat_html(html_content: str, article_id: str) -> str:
    soup = BeautifulSoup(html_content, "html.parser")

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

    content = soup.get_text("\n")
    content = re.sub(r"\n{3,}", "\n\n", content).strip()

    return content
