# PhotoBlog 项目 Agent 指南

## 项目目标（PRD v1.0）
- 以**照片为核心**的个人博客：上传照片后生成博文草稿
- 首页按时间轴组织，并在每个时间节点下用**瀑布流（Masonry）**展示照片
- 支持灯箱查看、懒加载与基础 SEO（SSR）
- 预留 AI 描述生成能力（可选开启）

## 技术栈与边界
- 前端：Next.js 16（App Router）+ Tailwind CSS v4 + Radix UI
- 后端：Next.js Route Handlers（`src/app/api`）
- DB：PostgreSQL（Prisma）
- 对象存储：MinIO（S3 兼容，本地开发）
- 鉴权：JWT（`jose`）+ HttpOnly Cookie

## 目录约定
- `src/app/*`：页面与 API
- `src/lib/*`：仅服务端逻辑（带 `server-only`）
- `src/components/*`：UI 组件（标注 `use client` 的为客户端组件）
- `prisma/schema.prisma`：数据模型

## 开发命令
- 安装依赖：`npm i`
- 生成 Prisma Client：`npm run prisma:generate`
- 本地开发：`npm run dev`

## 环境变量
- 参考 `.env.example`（本仓库已提供本地 `.env`，但不会被 Git 跟踪）
- 必填：`DATABASE_URL`、`AUTH_SECRET`、MinIO 相关

## 代码规范
- 服务端逻辑（DB/鉴权/存储/Sharp）必须放在 `src/lib/*` 并保持 `server-only`
- API 入口使用 zod 做入参校验；错误统一返回 `{ error: string }`
- 上传相关的 route（`/api/photos/upload`）必须标注 `export const runtime = "nodejs"`

## 常见任务定位
- 鉴权：`src/lib/auth.ts`
- 当前用户：`src/lib/current-user.ts`
- 上传处理：`src/app/api/photos/upload/route.ts`
- 时间轴查询：`src/lib/timeline.ts`

