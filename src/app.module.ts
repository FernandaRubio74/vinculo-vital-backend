import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CallsService } from './calls/calls.service';
import { CallsModule } from './calls/calls.module';

@Module({
  imports: [UsersModule, AuthModule, CallsModule],
  controllers: [AppController],
  providers: [AppService, CallsService],
})
export class AppModule {}
