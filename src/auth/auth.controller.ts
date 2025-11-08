import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterElderlyDto } from 'src/users/dtos/register-elderly.dto';
import { RegisterYoungDto } from 'src/users/dtos/register-volunteer.dto';
import { LoginDto } from 'src/users/dtos/login.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    //Registro de persona mayor, separado
    @Post('register-elderly')
    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'Email o teléfono ya registrado' })
    register(@Body() registerDto: RegisterElderlyDto) {
        return this.authService.registerElderly(registerDto);
    }

    //Registro de voluntario, separado
    @Post('register-volunteer')
    @ApiOperation({ summary: 'Registrar nuevo usuario voluntario' })
    @ApiResponse({ status: 201, description: 'Usuario voluntario registrado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'Email o teléfono ya registrado' })
    registerVolunteer(@Body() registerDto: RegisterYoungDto) {
        return this.authService.registerYoung(registerDto);
    }

    //login compartido
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiResponse({ status: 200, description: 'Logout exitoso' })
    logout() {
        return this.authService.logout();
    }
}