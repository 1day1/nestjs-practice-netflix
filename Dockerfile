# 베이스 이미지로 Node.js 사용
FROM node:22-slim

# pnpm 설치
RUN npm install -g pnpm

# 작업 디렉토리 설정
WORKDIR /app

# 애플리케이션 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --prod

# 앱 빌드
RUN pnpm run build

# 애플리케이션 코드 복사
COPY . .

# 프로덕션 모드로 실행
CMD ["pnpm", "run", "start:prod"]

# 포트 설정 (NestJS 기본 포트는 3000)
EXPOSE 3000