import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 모든 요청에 대해 CORS 허용
  // app.enableCors();
  // 특정 도메인만 허용하려면:
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3000', 
      'https://netflix-next.coolify.1day1.org',
    ],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false, // 인증 정보를 포함하지 않음
    // credentials: true,  // 쿠키를 포함한 요청 허용 여부
  });
  
  await app.listen(3000);
}
bootstrap();
