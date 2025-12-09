import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  // Enable CORS
  app.enableCors({
    origin: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://177.44.248.107:3000').split(','),
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('API para gerenciamento de notificações por email')
    .setVersion('1.0')
    .addTag('notifications')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT obtido no endpoint de login do User Service.',
        in: 'header',
      },
      'bearer-jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui.html', app, document);

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT || 8082;
  await app.listen(port);
  console.log(`Notification Service rodando na porta ${port}`);
  console.log(`Swagger disponível em: http://localhost:${port}/swagger-ui.html`);
}

bootstrap();
