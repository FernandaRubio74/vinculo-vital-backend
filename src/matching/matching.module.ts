import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService]
})
export class MatchingModule {}
