# 微光远征 GlimmerExpedition

> 大学生游戏化运动激励 Web 应用 · 把现实运动转化为奇幻冒险

## ▶︎ 在线体验

| 入口 | 链接 |
|---|---|
| 🌐 **作品 Demo** | **https://glimmer-expedition.netlify.app** |
| 🔌 后端 API | https://glimmer-expedition.onrender.com/api/health |
| 📦 源码仓库 | https://github.com/zyqyyds3344/glimmer-expedition |

**快速体验账号**：`晨曦小鹿 / 123456`（也可自行注册，首次登录会进入 5 题 Onboarding 由 Lumi 为你生成 7 天远征计划）

> ⏰ 首次打开若加载稍慢（10–60 秒），是 Render 免费档后端冷启动；刷新即可获得正常速度。

---

把每一次运动转化为「微光」，浇灌专属于你的世界树和岛屿；用 7 天 AI 计划开始远征，每日完成 3 张能量卡，获得护盾、解锁徽章；与搭子立下「微光之约」，让坚持不再孤独。

## 核心亮点（一眼看懂为什么不一样）

- 🌳 **世界树成长可视化** —— 运动转化的「微光」浇灌幼苗 / 成长 / 传说三阶段
- ⚡️ **心流暴击艺术卡** —— 连续 20/45 分钟触发 1.5×/2.0× 倍率，生成专属收藏卡画廊
- 🔋 **能量卡片每日三张** —— 碎片化任务，集齐合成护盾，配奖励预告
- 🤝 **搭子契约系统** —— 即刻发车 + 微光之约（长期契约 / 违约拯救动画）
- ✨ **Lumi AI 精灵** —— 不想运动 / 中断恢复 / 体测备考全部温柔鼓励式回复，可直接「采纳推荐」替换今日软任务
- 🏅 **6 大徽章体系** + 7 天 AI 远征计划
- 🌓 **深色 / 浅色双主题** 一键切换

## 产品闭环

```
首页（今日行动中心）
   ↓ 明确知道今日要做什么
完成 3 张能量卡片 / 1 次真实运动
   ↓ 微光 +N · 心流暴击艺术卡 · Toast 反馈
世界树成长 · 等级提升 · 阶段进化
   ↓ 解锁
徽章 / 护盾 / 心流卡 / 称号 / 岛屿装扮
   ↑ 反向激励
搭子契约 · Lumi 精灵 · 7 天 AI 计划
```

## 页面结构

| 路由 | 页面 | 核心 |
|---|---|---|
| `/login` | 登录注册 | 已存在 |
| `/onboarding` | **首次入口** | 5 题问卷 + Lumi 生成 7 天奇幻计划 |
| `/`（岛屿） | **今日行动中心** | 顶部状态条 / 世界树+成长反馈 / 今日 3 张能量卡 / 奖励预告 / 7 天计划进度 |
| `/sport`（运动） | 真实运动入口 | Lumi 今日推荐 + 模式选择 + 时长卡片 + 完成模拟 + 心流暴击艺术卡 |
| `/lumi` | **微光精灵 Lumi** | 6 个快捷问题 + 输入对话 + 鼓励式 mock 回复 + "采纳建议"换软任务 |
| `/social` | 搭子 | 即刻发车（含时间/地点/人数） + 微光之约（双方进度 + 提醒 + 拯救动画） |
| `/achievement` | 徽章墙 | 6 大分类 tab + 即将解锁 + 徽章详情弹窗 + 进度条 |
| `/profile` | 角色主页 | 称号 + 8 格身份资产 + 精灵 + 心流卡画廊 + 统计图表 + 羁绊 + 徽章入口 |

## 核心玩法

### 微光（核心货币）
- 由真实运动转化得到：`基础能量 = 时长 × 类型系数`
- 心流暴击：连续 ≥ 20 分钟 1.5×，连续 ≥ 45 分钟 2.0×
- 用于让世界树升级、解锁阶段（幼苗 / 成长 / 传说）

### 能量卡片（每日主线）
- 每日 3 张随机抽取，每张 25 ~ 60 微光
- 完成后弹出 toast 反馈，世界树成长可视化
- 集齐 3/3 → 护盾碎片 +1，每 3 个碎片 → 护盾 +1

### 心流暴击艺术卡
- 单次运动 ≥ 20 分钟即生成一张专属艺术卡
- 在「我的」页心流卡画廊永久收藏

### 搭子契约
- **即刻发车**：5 分钟匹配虚拟搭子，完成会有「微光相遇 +10%」的彩虹桥动画
- **微光之约**：长期契约（7/14/30 天），双方进度并排展示，可一键温柔提醒；违约触发"小人落水"动画，需运动一次或消耗护盾拯救

### 微光精灵 Lumi（AI 助手）
- 6 个快捷问题：不想运动 / 5 分钟训练 / 体测 / 中断恢复 / 跑步替代 / 强度建议
- 全部使用温和、低压力、鼓励式 mock 回复
- 部分回复支持「采用 Lumi 建议」按钮，将今日任务替换为最低门槛恢复任务

### 7 天 AI 远征计划
- 首次进入根据 5 题问卷生成
- 每天有奇幻命名（点亮第一缕微光 / 唤醒幼苗 / 收集星尘 / 恢复之雨 / 心流试炼 …）
- 在首页底部以 7 格条状视觉呈现进度

### 成就徽章
- 4+2 大类：频次 / 强度 / 场景 / 连续 / 社交
- 每个徽章带 progress、阈值描述
- 「即将解锁」按完成度排序展示前 3 条，并提示具体差几

### 身份资产（我的页）
- 称号（自动按等级生成）+ 头像 + 精灵 + 岛屿阶段
- 累计运动天数 / 总时长 / 心流卡 / 护盾 / 契约份数
- 心流艺术卡片画廊
- 解锁徽章一览（点击跳转完整徽章墙）

## 技术架构

```
frontend/
├── src/
│   ├── api/client.ts          # 通用 fetch 封装 + Token
│   ├── services/index.ts      # 领域 service 层（user/onboarding/task/sport/achievement/social/lumi）
│   ├── lib/
│   │   ├── concepts.ts        # 产品概念常量、阶段反馈文案、心流提示
│   │   └── Toast.tsx          # 全局 Toast 系统（zustand）
│   ├── store/userStore.ts     # 用户状态
│   ├── components/            # WorldTree / FloatingIsland / Starfield / BottomNav / Layout
│   └── pages/                 # Login / Onboarding / Home / Sport / Lumi / Social / Achievement / Profile

backend/
└── src/
    ├── db.ts                  # SQLite schema + 自动字段迁移
    ├── auth.ts                # JWT
    ├── utils.ts               # 能量计算 / 等级换算
    ├── achievementsEngine.ts  # 成就判定 + computeProgress
    ├── seed.ts                # 8 位虚拟用户预置
    └── routes/
        ├── auth.ts
        ├── user.ts            # /me 含 stage / onboarded / plan
        ├── sports.ts
        ├── tasks.ts           # /today/preview 聚合奖励预告
        ├── achievements.ts    # 含 progress 字段
        ├── teams.ts           # 即刻发车
        ├── contracts.ts       # 微光之约
        ├── onboarding.ts      # 7 天计划生成
        └── lumi.ts            # AI mock 回复 + adopt-soften
```

## 主要 API

| 路径 | 方法 | 说明 |
|---|---|---|
| `/api/auth/login` `/register` | POST | 登录 / 注册 |
| `/api/user/me` | GET | 当前用户（含 stage / onboarded / plan） |
| `/api/onboarding/submit` | POST | 提交问卷 + 生成 7 天计划 |
| `/api/onboarding/plan` | GET | 取计划 |
| `/api/onboarding/plan/complete/:day` | POST | 标记某天完成 |
| `/api/tasks/today/preview` | GET | 今日 3 张能量卡 + 奖励预告 |
| `/api/tasks/complete/:id` | POST | 完成一张能量卡 |
| `/api/sports/record` | POST | 记录一次运动（含心流暴击+成就触发） |
| `/api/sports/stats` | GET | 类型分布 / 14 天能量趋势 |
| `/api/achievements` | GET | 徽章列表 + 进度 + 提示 |
| `/api/teams/open` `/create` `/join/:id` | - | 即刻发车 |
| `/api/contracts/mine` `/create` `/checkin/:id` `/breach/:id` `/rescue/:id` | - | 微光之约 |
| `/api/lumi/prompts` `/ask` `/adopt-soften` | - | Lumi AI |

## 快速启动

> ⚠️ Node 24 + 中文路径环境下，请先把 npm 源设为镜像：`npm config set registry https://registry.npmmirror.com`

### 启动后端（终端 A）

```bash
cd /Users/hb41235/Documents/学校任务/美团-AI作品/微光远征/backend
npm install          # 仅仅首次需要
npm run dev          # http://localhost:4000
```

首次启动自动建库 + 写入种子数据 + 增量字段迁移。

### 启动前端（终端 B）

```bash
cd /Users/hb41235/Documents/学校任务/美团-AI作品/微光远征/frontend
npm install          # 仅仅首次需要
npm run dev          # http://localhost:5173
```

打开 http://localhost:5173，**首次登录会跳转到 Onboarding 页**，填完 5 题后才进入岛屿。

### 一键脚本

```bash
./start.sh           # macOS / Linux
```

## 默认测试账号

8 位虚拟用户（密码统一 `123456`）：晨曦小鹿(跑步) / 月下听风(瑜伽) / 浪花骑士(游泳) / 山野追风(骑行) / 铁壁阿星(健身) / 星河漫步(步行) / 灌篮少年(球类) / 暮色行者(步行)。也可自行注册新账号。

> 注：已有种子用户的 `onboarding` 字段为空，登录后会被引导到 Onboarding 页面，体验完整闭环。

## 体验路径建议

1. 注册新账号 → 完成 Onboarding 5 题 → 看 7 天计划生成
2. 首页：完成 3 张能量卡，看世界树进度涨、Toast 反馈
3. 集齐 3/3 → 护盾碎片 +1，每 3 碎片合成护盾
4. 运动页：选 45 分钟跑步 → 触发 ⚡⚡ 心流暴击艺术卡片
5. Lumi：点「我已经中断 3 天了，怎么恢复？」→ 采用建议 → 回首页看任务被替换
6. 社交：发起即刻组队、缔结微光之约、模拟违约 → 拯救
7. 成就：看分类 + 即将解锁，点徽章看详情弹窗
8. 我的：欣赏角色主页、心流卡画廊、统计图表

## 视觉规范

- 深色背景（`#0B0A1F` / `#161430`）+ 微光渐变（金 `#FFD86B` / 紫 `#9C6BFF` / 蓝 `#5BA8FF`）
- 大圆角（`rounded-2xl` / `rounded-3xl`）+ 玻璃感（`glass`）
- 移动端优先（`max-w-md`），底部固定导航中间凸起 Lumi 按钮
- 微动效：星空背景、岛屿浮动、世界树呼吸、徽章光晕、Toast 滑入

## 技术栈

| 层 | 技术 |
|---|---|
| 前端构建 | Vite |
| 前端框架 | React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 动效 | Framer Motion |
| 状态 | Zustand |
| 路由 | React Router v6 |
| 图标 | Lucide React |
| 图表 | Recharts |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite（better-sqlite3） |
| 鉴权 | JWT |
