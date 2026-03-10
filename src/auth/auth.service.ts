import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  
  async register(dto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(dto.password, 12);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password_hash,
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);

    // Ne pas retourner le mot de passe
    const { password_hash: _, ...result } = user as any;
    return { user: result, token };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect.');

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect.');

    const token = this.generateToken(user);

    return { token };
  }

  getMe(user: User) {
    const { password_hash: _, ...result } = user;
    return result;
  }

  private generateToken(user: User) {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }
}
