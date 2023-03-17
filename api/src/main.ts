import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { authMiddleware } from './v1/middleware/auth.middleware';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* Cors */
  const whitelist = [
    'http://localhost:3001',
    'http://192.168.110.207:3001',
    'http://194.233.70.59:8082',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  /* Middleware */

  app.use(authMiddleware);

  app.setGlobalPrefix(`api/${process.env.VERSION}`);
  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
