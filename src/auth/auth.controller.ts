import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // POST /api/auth/register
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login
  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /api/auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Voir son profil' })
  @ApiResponse({ status: 200, description: 'Profil retourné.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getMe(@Request() req) {
    return this.authService.getMe(req.user);
  }
}
