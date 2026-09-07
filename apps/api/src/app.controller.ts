import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  @Get()
  getApp(@Res() res: Response) {
    const distHtml = path.resolve(process.cwd(), 'dist/index.html');
    if (fs.existsSync(distHtml)) {
      return res.sendFile(distHtml);
    }
    const webDistPath = path.resolve(process.cwd(), 'apps/web/dist/index.html');
    if (fs.existsSync(webDistPath)) {
      return res.sendFile(webDistPath);
    }
    const webSrcPath = path.resolve(process.cwd(), 'apps/web/index.html');
    if (fs.existsSync(webSrcPath)) {
      return res.sendFile(webSrcPath);
    }
    return res.json({
      name: 'PyVM Obfuscator & Native Rust Virtualizer API',
      status: 'operational',
      engine: 'NestJS Hexagonal Orchestration Engine',
      endpoints: [
        'POST /obfuscate',
        'GET /presets',
        'GET /presets/:id',
        'POST /simulate',
        'POST /analysis/entropy',
      ],
    });
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      engine: 'NestJS Pure Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
