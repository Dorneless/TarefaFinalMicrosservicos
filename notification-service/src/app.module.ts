import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerConfig } from './config/email.config';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerConfig,
    NotificationModule,
  ],
})
export class AppModule { }
