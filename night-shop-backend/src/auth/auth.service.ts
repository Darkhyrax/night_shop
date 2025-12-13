import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        try {
            const user = await this.usersService.findByUsername(username);
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password,
            );

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const payload = {
                sub: user.id,
                username: user.username,
                role: user.role,
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
