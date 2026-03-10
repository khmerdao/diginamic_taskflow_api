import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  app.enableCors();

  // Configuration Swagger 
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
      tagsSorter: 'alpha',        // ← trie les tags (groupes) par ordre alphabétique
      operationsSorter: 'alpha',  // ← trie les routes par ordre alphabétique
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 TaskFlow API démarrée sur http://localhost:${port}/api`);
}
bootstrap();
