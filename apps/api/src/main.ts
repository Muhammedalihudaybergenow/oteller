import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('api')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );

  // Custom morgan token for colored method
  morgan.token('colored-method', (req, res) => {
    switch (req.method) {
      case 'GET':
        return chalk.blue(req.method);
      case 'POST':
        return chalk.green(req.method);
      case 'PATCH':
        return chalk.hex('#87ceeb')(req.method); // Light blue
      case 'DELETE':
        return chalk.red(req.method);
      default:
        return req.method;
    }
  });

  // Custom morgan format
  const morganFormat = ':colored-method :url :status :response-time ms - :res[content-length]';

  // Apply morgan middleware
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => Logger.log(message.trim(), 'HTTP'),
      },
    })
  );

  // Detailed body logging with colors
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const logDir = path.join(__dirname, './assets/logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  morganBody(app.getHttpAdapter().getInstance(), {
    noColors: false,
    prettify: true,
    logRequestBody: true,
    logResponseBody: true,
    stream: {
      write: (message): boolean => {
        const coloredMessage = message
          .replace(/POST/g, chalk.green('POST'))
          .replace(/GET/g, chalk.blue('GET'))
          .replace(/PATCH/g, chalk.hex('#87ceeb')('PATCH'))
          .replace(/DELETE/g, chalk.red('DELETE'));
        
        Logger.debug(coloredMessage.trim(), 'HTTP Detail');
        
        if (isProd) {
          const statusCode = parseInt(message.split(' ')[2]);
          if (statusCode >= 400) {
            fs.appendFileSync(
              path.join(__dirname, '../assets/logs/error.log'),
              `${new Date().toISOString()} - ${message}\n`
            );
          }
        }
        
        return true;
      },
    },
    skip: (req, res) => req.url.includes('/docs'),
  });
}

bootstrap();
