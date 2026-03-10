import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { id: number; email: string }) {
    const user = await this.userRepository.findOne({ where: { id: payload.id } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable.');
    return user;
  }
}