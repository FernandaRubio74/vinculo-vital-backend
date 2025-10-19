import { Controller, Post, Body } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) {}

    @Post('test')
    async testMatching(@Body() body: any) {
        const { target, candidates } = body;
        return await this.matchingService.aiMatch(target, candidates, 5);
        }
}
