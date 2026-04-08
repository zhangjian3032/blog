# PhotoBlog 项目方案（基于 PRD：照片博客平台 - 时间轴瀑布流布局）

## 1. 范围与里程碑
### MVP（对应 PRD M1）
- 用户注册/登录（邮箱/用户名 + 密码）
- 照片批量上传（单次 ≤ 50 张，单张 ≤ 30MB）
- EXIF 解析（拍摄时间等元数据入库）
- 自动生成缩略图（小/中/大）并存储到对象存储
- 自动创建博文草稿 + 编辑标题/正文 + 发布
- 首页时间轴 + 瀑布流展示 + 灯箱查看

### 增强（对应 PRD M2/M3）
- AI 描述生成（已预留接口，可选启用）
- 主题切换（明亮/暗黑，已实现基础版）
- 年/月/日筛选、滚动动画、地图视图、隐私设置（已预留字段/枚举）

## 2. 架构设计
### 分层
- 展示层：SSR/CSR 混合（首页 SSR 输出结构，瀑布流与灯箱为 Client Component）
- 业务逻辑层：Next Route Handlers（`src/app/api/*`）
- 存储层：Postgres（元数据）+ MinIO（原图与缩略图）

### 核心链路（上传 → 草稿 → 发布 → 展示）
1) 用户在 `/upload` 选择多张照片
2) `POST /api/photos/upload`：
   - 校验数量与大小
   - 解析 EXIF（`exifr`）
   - 生成 3 个尺寸缩略图（`sharp`）
   - 上传到 MinIO（S3）
   - 写入 `photos` 表，并在首次上传时创建 `posts` 草稿
3) 用户在 `/posts/:id/edit` 编辑标题/正文/可见性并发布
4) 首页 `/` 拉取时间轴数据并按月份分组渲染瀑布流

## 3. 数据模型（Prisma）
- `User`：账号信息、主题偏好
- `Post`：博文（标题、正文、可见性、发布时间）
- `Photo`：图片元数据（原图/缩略图 URL、宽高、EXIF、拍摄时间）

对应实现：`prisma/schema.prisma`

## 4. API 设计（MVP 已落地）
- 鉴权
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- 上传与内容
  - `POST /api/photos/upload`
  - `GET /api/timeline`
  - `GET/PUT/DELETE /api/posts/:id`
  - `POST /api/posts/:id/publish`
- AI（可选）
  - `POST /api/ai/describe`

## 5. 前端页面与交互
- `/`：时间轴 + 瀑布流（按月份分组）+ 灯箱查看
- `/login`、`/register`：基础账号体系
- `/upload`：批量上传，成功后跳转到编辑页
- `/posts/:id/edit`：编辑标题/正文/可见性，支持发布
- `/posts/:id`：公开阅读页（MVP 基础版）

## 6. 非功能与风险
- 性能：缩略图 + 懒加载（Next Image）
- 安全：JWT HttpOnly Cookie；私密/草稿不可匿名访问
- 风险：HEIC 在本地 Sharp 运行环境可能不完整（取决于 libvips 编译能力），建议生产环境使用已支持 HEIC 的镜像或异步转码服务

