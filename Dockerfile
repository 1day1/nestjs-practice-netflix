# 빌드 스테이지
FROM node:22 AS builder

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
RUN pnpm install

# 앱 빌드
RUN pnpm run build


# 프로덕션 스테이지
FROM node:22-slim

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# pnpm 설치
RUN npm install -g pnpm

# 빌드 스테이지에서 필요한 파일들만 복사
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/dist ./dist

# 프로덕션 의존성만 설치
RUN pnpm install --prod


# 프로덕션 모드로 실행
CMD ["pnpm", "run", "start:prod"]

# 포트 설정 (NestJS 기본 포트는 3000)
EXPOSE 3000