import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureHelmet } from './bootstrap/helmet';
import { configureValidation } from './bootstrap/validation';
import { configureSwagger } from './bootstrap/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureHelmet(app);
  configureValidation(app);
  configureSwagger(app);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200'],
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
