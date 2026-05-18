# Article Collector

微信公众号文章自动收藏和管理工具。iPhone 一键分享 → 后端自动提取内容（含图片）→ 存入数据库 → 通过 ChatGPT Custom GPT 问答。

## 技术栈

- 后端：Python 3.11+ / FastAPI / Playwright
- 数据库 + 图片存储：Supabase (PostgreSQL + Storage)
- 部署：Railway（后端）、Vercel（前端，Phase 3）
- 手机端：iOS Shortcuts
- 问答：ChatGPT Custom GPT + Actions

## 目录结构

```
article-collector/
├── app/
│   ├── main.py           # FastAPI 入口
│   ├── config.py         # 环境变量配置
│   ├── database.py       # Supabase 数据库操作
│   ├── extractor.py      # 文章内容提取（Playwright）
│   ├── storage.py        # 图片存储（Supabase Storage）
│   └── routers/
│       └── articles.py   # 文章 API 端点
├── .env                  # 环境变量（不提交）
├── .env.example          # 环境变量模板
├── requirements.txt      # Python 依赖
└── Dockerfile            # Railway 部署用
```

## 数据库

### articles 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，默认 gen_random_uuid() |
| url | TEXT | 原始链接，UNIQUE |
| title | TEXT | 文章标题 |
| author | TEXT | 作者/公众号名称 |
| content | TEXT | 正文（Markdown，图片链接指向 Supabase Storage） |
| source | TEXT | 来源：wechat / xiaohongshu / manual |
| status | TEXT | 提取状态：pending / completed / failed |
| notes | TEXT | 个人备注 |
| published_at | TIMESTAMPTZ | 文章发布时间 |
| created_at | TIMESTAMPTZ | 收藏时间，默认 now() |

### 图片存储

- Supabase Storage bucket：`article-images`
- 文件路径：`{article_id}/{hash}.{ext}`
- 正文中引用格式：`![](https://{project}.supabase.co/storage/v1/object/public/article-images/{path})`

## API 设计

- 路由前缀：`/api/v1`
- 鉴权：`X-API-Key` header
- Phase 1 端点：
  - `POST /api/v1/articles` — 提交 URL，触发提取
  - `GET /api/v1/articles` — 文章列表
  - `GET /api/v1/articles/{id}` — 文章详情
- Phase 2 端点：
  - `GET /api/v1/articles/search` — 搜索（供 ChatGPT Actions）

## 开发规范

- 代码风格遵循 PEP 8
- 环境变量通过 .env 管理，不硬编码任何密钥
- 图片必须下载到 Supabase Storage 并替换原始链接，不依赖外部图片 URL
- 每个提取器（微信、小红书）独立实现，通过 source 字段区分
