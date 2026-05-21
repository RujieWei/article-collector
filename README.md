# Article Collector

微信公众号文章的个人收藏、管理和 AI 问答工具。

## 为什么做这个

微信公众号是我最主要的信息输入渠道，但微信自带的收藏功能有几个痛点：

- **搜索不好用**：收藏了几百篇文章后，靠关键词很难找到想要的那篇
- **不能跨平台访问**：只能在微信里看，电脑上浏览器打不开
- **没有 AI 能力**：想问「之前看过的那篇关于 Agent 架构的文章说了什么」，没有办法

Article Collector 解决这三个问题：iPhone 一键收藏文章全文 → 存入自己的数据库 → 通过 ChatGPT 基于收藏内容问答 → 通过 Web 界面管理和阅读。

## 功能

- **一键收藏**：在 iPhone 上看到好文章，通过分享菜单一键收藏，自动提取标题、作者、全文和图片
- **AI 问答**：通过 ChatGPT Custom GPT（「小韦的智库」）提问，AI 会搜索文章库并基于原文回答
- **Web 管理**：在浏览器中查看文章列表、阅读全文、添加个人备注、删除不需要的文章

## 使用流程

### 收藏文章

1. 在微信中打开公众号文章
2. 点右上角「...」→「在 Safari 中打开」
3. 点分享按钮 → 选择「收藏文章」快捷指令
4. 弹出「文章已收藏」通知，完成

背后发生了什么：Safari 中的 JavaScript 提取页面 HTML → iOS Shortcut 把标题、作者、HTML 内容打包成 JSON → POST 到后端 API → 后端解析 HTML、下载图片到自有存储、转成 Markdown → 存入数据库。

### AI 问答

打开 ChatGPT，进入「小韦的智库」GPT，直接提问：

- 「之前收藏过哪些关于 AI Agent 的文章？」
- 「帮我总结一下那篇豆包的文章的核心观点」
- 「对比一下最近收藏的几篇文章对 AI 产品的看法」

GPT 通过 Actions 调用后端搜索 API，找到相关文章后基于原文内容回答。

### 管理文章

打开 Web 管理界面（部署在 Vercel），可以：

- 浏览所有收藏的文章，按时间倒序排列
- 点击文章标题查看全文（Markdown 渲染，图片正常显示）
- 给文章添加个人备注
- 删除不再需要的文章

## 系统架构

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ iPhone Safari│────→│ iOS Shortcut │────→│  Railway         │
│ (JS 提取HTML)│     │ (POST 请求)  │     │  FastAPI 后端    │
└─────────────┘     └──────────────┘     │                  │
                                          │  · 解析 HTML     │
┌─────────────┐                          │  · 下载图片      │
│ ChatGPT     │←────────────────────────→│  · 搜索/CRUD     │
│ Custom GPT  │   OpenAPI Actions        │                  │
└─────────────┘                          └────────┬─────────┘
                                                  │
┌─────────────┐     ┌──────────────┐              │
│   浏览器     │────→│ Vercel       │──────────────┘
│             │     │ Next.js 前端  │     API 调用
└─────────────┘     └──────────────┘
                                          ┌──────────────────┐
                          所有数据存储 ───→ │ Supabase         │
                                          │ PostgreSQL + 图片 │
                                          └──────────────────┘
```

**各组件职责：**

| 组件 | 职责 |
|------|------|
| **iOS Shortcut + Safari JS** | 在手机端提取微信文章的完整 HTML，发送到后端 |
| **FastAPI 后端** | 接收文章、解析内容、管理图片、提供搜索和 CRUD API |
| **Supabase** | PostgreSQL 存储文章数据，Storage 存储文章中的图片 |
| **Next.js 前端** | 文章管理界面，所有 API 调用在服务端完成（不暴露密钥） |
| **ChatGPT Custom GPT** | 通过 OpenAPI Actions 连接后端，提供 AI 问答能力 |

## 技术决策

### 客户端提取 vs 服务端爬虫

**问题**：需要获取微信公众号文章的完整内容。

**最初方案**：服务端用 Playwright 无头浏览器访问微信文章 URL 并提取内容。

**实际情况**：微信封禁了数据中心的 IP 段（包括 AWS、GCP 等），服务端根本打不开微信文章页面。

**最终方案**：在用户手机上的 Safari 中用 JavaScript 直接提取已经加载好的页面 HTML，通过 iOS Shortcut 发送到后端。后端只负责解析 HTML（BeautifulSoup），不需要访问微信服务器。

**权衡**：牺牲了「给个 URL 就能自动抓取」的体验，换来了 100% 的成功率和零封禁风险。而且实际操作只需要多一步「在 Safari 中打开」，可以接受。

### 图片存储到 Supabase Storage

**问题**：微信文章中的图片托管在腾讯 CDN（mmbiz.qpic.cn），有 Referer 防盗链。

**风险**：如果直接引用原始图片链接，腾讯随时可能切断访问，所有收藏文章的图片都会挂掉。

**方案**：后端在解析文章时，把所有图片下载到 Supabase Storage（公开 bucket），并替换 Markdown 中的图片链接。即使微信原始链接失效，收藏的文章图片仍然正常显示。

### Next.js Server Components

**问题**：前端需要调用后端 API，API 需要密钥鉴权。

**常见做法**：前端请求自己的 API Route，API Route 再转发给后端。多一层中间代理。

**方案**：用 Next.js Server Components 直接在服务端获取数据、Server Actions 处理表单操作。API 密钥只存在于 Vercel 的服务端环境变量中，永远不会发送到浏览器。代码更少，架构更简单。

## 技术栈

| 层 | 技术 | 部署平台 |
|---|---|---|
| 后端 API | Python / FastAPI / BeautifulSoup | Railway |
| 数据库 | Supabase PostgreSQL | Supabase Cloud |
| 图片存储 | Supabase Storage | Supabase Cloud |
| 前端 | Next.js / Tailwind CSS | Vercel |
| 手机端 | iOS Shortcuts + Safari JavaScript | 本地 |
| AI 问答 | ChatGPT Custom GPT + OpenAPI Actions | OpenAI |

## 项目结构

```
article-collector/
├── app/                        # 后端（FastAPI）
│   ├── main.py                 # 应用入口、中间件、CORS
│   ├── config.py               # 环境变量配置
│   ├── database.py             # Supabase 客户端初始化
│   ├── parser.py               # HTML → Markdown 解析器
│   ├── storage.py              # 图片下载和上传到 Supabase Storage
│   └── routers/
│       └── articles.py         # 文章 CRUD + 搜索 API
├── web/                        # 前端（Next.js）
│   ├── app/
│   │   ├── layout.tsx          # 全局布局
│   │   ├── page.tsx            # 首页：文章列表
│   │   ├── delete-button.tsx   # 删除按钮（客户端组件）
│   │   └── articles/[id]/
│   │       ├── page.tsx        # 文章详情页：Markdown 渲染
│   │       └── notes-editor.tsx # 备注编辑器（客户端组件）
│   └── lib/
│       ├── api.ts              # 后端 API 调用封装（服务端）
│       └── actions.ts          # Server Actions（删除、更新备注）
├── Dockerfile                  # 后端部署配置
└── requirements.txt            # Python 依赖
```
