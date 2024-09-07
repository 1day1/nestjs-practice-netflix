# 베이스 이미지로 Node.js 사용
FROM node:22
LABEL org.opencontainers.image.source="https://github.com/1day1/nestjs-practice-netflix"

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
RUN pnpm install

# 앱 빌드
RUN pnpm run build

# 앱 소스 복사 - already exists
COPY . /app

# 작업 디렉토리 설정
WORKDIR /app

# 프로덕션 모드로 실행
CMD ["pnpm", "run", "start:prod"]

# 포트 설정 (NestJS 기본 포트는 3000)
EXPOSE 3000