import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Throttle({ login: { limit: 5, ttl: 60000 } })
    @Post('login')
    @ApiOperation({ summary: 'Login de usuario', description: 'Autentica un usuario y retorna un token JWT' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login exitoso, retorna token y datos del usuario' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    @ApiResponse({ status: 429, description: 'Demasiados intentos de login (máximo 5 por minuto)' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil del usuario', description: 'Retorna los datos del usuario autenticado' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Datos del usuario autenticado' })
    @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
    getProfile(@Request() req) {
        return { user: req.user };
    }
}
