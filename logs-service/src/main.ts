import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Client } from 'pg';

async function bootstrap() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5555', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'testefinal_db',
  });

  try {
    await client.connect();
    await client.query('CREATE SCHEMA IF NOT EXISTS logs_schema');
    await client.end();
  } catch (error) {
    console.error('Failed to create schema:', error);
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Logs Service API')
    .setDescription('API para centralização de logs')
    .setVersion('1.0')
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
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://177.44.248.107:3000').split(','),
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8084);
}
bootstrap();
