from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import articles

app = FastAPI(title="Article Collector", version="0.1.0")


@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)

    api_key = request.headers.get("X-API-Key")
    if api_key != settings.api_key:
        return JSONResponse(status_code=401, content={"detail": "Invalid API key"})
    return await call_next(request)


app.include_router(articles.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
