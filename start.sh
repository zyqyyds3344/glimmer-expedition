#!/bin/bash
# 一键启动微光远征（前后端）
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> 安装后端依赖"
(cd "$ROOT/backend" && npm install)

echo "==> 安装前端依赖"
(cd "$ROOT/frontend" && npm install)

echo "==> 启动后端 (端口 4000)"
(cd "$ROOT/backend" && npm run dev) &
BACK_PID=$!

sleep 2
echo "==> 启动前端 (端口 5173)"
(cd "$ROOT/frontend" && npm run dev) &
FRONT_PID=$!

trap "kill $BACK_PID $FRONT_PID 2>/dev/null" EXIT INT TERM
wait
