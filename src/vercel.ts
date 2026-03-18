import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Entrée Vercel (Serverless Function).
 *
 * Objectif : ne pas utiliser app.listen().
 * On réutilise la même instance Nest entre les invocations via un cache en mémoire.
 */
let cachedHandler: ((req: any, res: any) => any) | null = null;

async function createNestServer() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();

  // Swagger (accessible via /api/docs)
  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('API REST de gestion de tâches')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.init();

  // Nest expose un express instance sous-jacent
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedHandler) {
    cachedHandler = await createNestServer();
  }
  // À ce stade cachedHandler est défini (TS ne l'infère pas toujours)
  return cachedHandler!(req, res);
}
