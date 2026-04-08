# 部署与本地运行

## 1. 本地运行（推荐：Docker 提供 Postgres/Redis/MinIO）
1) 准备环境变量：复制 `.env.example` 到 `.env` 并按需修改
2) 启动依赖（需要 Docker Compose）：
   - `docker compose up -d postgres redis minio minio-init`
3) 初始化 Prisma：
   - `npm run prisma:generate`
   - `npm run prisma:migrate`（或 `npm run prisma:push`）
4) 启动 Web：
   - `npm run dev`
5) 访问：
   - Web：`http://localhost:3000`
   - MinIO Console：`http://localhost:9001`（默认账号/密码见 `docker-compose.yml`）

## 2. 生产部署（Docker Compose 一体化）
1) 修改 `docker-compose.yml` 中 `web.environment.AUTH_SECRET`、数据库/MinIO 密码
2) 启动：
   - `docker compose up -d --build`
3) 数据库迁移：
   - 进入容器或在 CI 中运行 `npx prisma migrate deploy`（请确保使用项目本地 Prisma 版本：在仓库目录执行 `npx prisma -v`）

## 3. 关键配置说明
- MinIO 桶：`photoblog`（`minio-init` 会自动创建并设置匿名下载，便于本地直接通过 URL 展示）
- 图片域名：通过 `MINIO_PUBLIC_URL` 组装图片访问 URL

## 4. 健康检查
- `GET /api/health`
