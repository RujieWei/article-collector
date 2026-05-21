from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import articles

app = FastAPI(
    title="Article Collector",
    version="0.1.0",
    description="Personal article collection and search API. Collects WeChat articles and provides search/retrieval for ChatGPT integration.",
    servers=[{"url": "https://article-collector-rjt3.onrender.com"}],
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://article-collector-web.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    public_paths = {"/health", "/openapi.json", "/docs", "/redoc"}
    if request.url.path in public_paths:
        return await call_next(request)

    api_key = request.headers.get("X-API-Key")
    if api_key != settings.api_key:
        return JSONResponse(status_code=401, content={"detail": "Invalid API key"})
    return await call_next(request)


app.include_router(articles.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
