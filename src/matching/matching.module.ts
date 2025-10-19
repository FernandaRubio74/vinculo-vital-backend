import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';

@Module({
    imports: [ConfigModule],
    controllers: [MatchingController],
    providers: [MatchingService],
    exports: [MatchingService], // para usarlo desde otros módulos
})
export class MatchingModule {}
