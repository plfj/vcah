import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../apps/api/src/app.module';

let cachedApp: NestExpressApplication | null = null;

export async function bootstrap(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    })
  );

  const distPath = path.resolve(process.cwd(), 'dist');
  const webDistPath = path.resolve(process.cwd(), 'apps/web/dist');
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    app.useStaticAssets(distPath);
  } else if (fs.existsSync(webDistPath)) {
    app.useStaticAssets(webDistPath);
  }

  if (process.env.VERCEL) {
    await app.init();
    cachedApp = app;
    return app;
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`[PyVM NestJS Orchestration Engine] Server running on port ${port}`);
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}

if (require.main === module || !process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error('[NestJS Bootstrap Error]', err);
  });
}
