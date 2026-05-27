from __future__ import annotations

import re
from playwright.async_api import async_playwright
from app.storage import upload_image


async def extract_wechat_article(url: str, article_id: str) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-sandbox",
            "--single-process",
        ])
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle", timeout=30000)

        title = await page.locator("#activity-name").inner_text()
        title = title.strip()

        author = ""
        author_el = page.locator("#js_name")
        if await author_el.count() > 0:
            author = (await author_el.inner_text()).strip()

        cover_url = ""
        og_el = page.locator('meta[property="og:image"]')
        if await og_el.count() > 0:
            og_src = await og_el.get_attribute("content")
            if og_src:
                uploaded = await upload_image(article_id, og_src)
                cover_url = uploaded or og_src

        content_el = page.locator("#js_content")
        if await content_el.count() == 0:
            await browser.close()
            return {"title": title, "author": author, "content": "", "cover_image": cover_url}

        images = await content_el.locator("img").all()
        image_map = {}
        for img in images:
            src = await img.get_attribute("data-src") or await img.get_attribute("src")
            if not src:
                continue
            public_url = await upload_image(article_id, src)
            if public_url:
                image_map[src] = public_url

        await page.evaluate("""(imageMap) => {
            const content = document.querySelector('#js_content');
            if (!content) return;
            content.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                const newUrl = imageMap[src] || src;
                const marker = document.createTextNode('\\n![image](' + newUrl + ')\\n');
                img.parentNode.replaceChild(marker, img);
            });
            content.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
                h.textContent = '\\n## ' + h.textContent.trim() + '\\n';
            });
            content.querySelectorAll('strong, b').forEach(el => {
                el.textContent = '**' + el.textContent + '**';
            });
        }""", image_map)

        content_md = await content_el.inner_text()
        content_md = re.sub(r"\n{3,}", "\n\n", content_md).strip()

        await browser.close()

    return {
        "title": title,
        "author": author,
        "content": content_md,
        "cover_image": cover_url,
    }
