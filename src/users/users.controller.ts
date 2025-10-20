import { Controller, Get, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { Interest } from './entities/interest.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Users & Interests')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener usuarios activos' })
  @ApiQuery({ name: 'userType', required: false, description: 'Filtrar por tipo de usuario (elderly | volunteer)' })
  @ApiOkResponse({ description: 'Lista de usuarios', type: User, isArray: true })
  async findAll(@Query('userType') userType?: string): Promise<User[]> {
    return await this.usersService.findAll(userType);
  }

  @Get('interests')
  @ApiOperation({ summary: 'Obtener todos los intereses activos' })
  @ApiResponse({ status: 200, description: 'Lista de intereses ordenados por categoría', type: Interest, isArray: true })
  async getAllInterests(): Promise<Interest[]> {
    return await this.usersService.getInterests();
  }

  @Get('interests/by-category')
  @ApiOperation({ summary: 'Obtener intereses agrupados por categoría' })
  @ApiResponse({ status: 200, description: 'Intereses organizados por categoría' })
  async getInterestsByCategory(): Promise<Record<string, Interest[]>> {
    return await this.usersService.getInterestsByCategory();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por id' })
  @ApiParam({ name: 'id', required: true, description: 'UUID del usuario' })
  @ApiOkResponse({ description: 'Usuario encontrado', type: User })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', required: true, description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Usuario actualizado', type: User })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', required: true, description: 'UUID del usuario' })
  @ApiNoContentResponse({ description: 'Usuario eliminado' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.usersService.remove(id);
  }
}
