import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { Interest } from './entities/interest.entity';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get()
    findAll(@Query('userType') userType?: string): Promise<User[]> {
        return this.usersService.findAll(userType);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }

    @Get('interests/all')
    getInterests(): Promise<Interest[]> {
        return this.usersService.getInterests();
    }

    @Get('interests/by-category')
    getInterestsByCategory(): Promise<Record<string, Interest[]>> {
        return this.usersService.getInterestsByCategory();
    }
}
