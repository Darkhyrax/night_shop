import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class AdminUserSeeder {
    private readonly logger = new Logger(AdminUserSeeder.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async seed(): Promise<void> {
        const adminCount = await this.usersRepository.count({
            where: { role: UserRole.ADMIN },
        });

        if (adminCount === 0) {
            this.logger.log('Creando usuario administrador por defecto...');

            const saltRounds = parseInt(
                process.env.BCRYPT_SALT_ROUNDS || '10',
                10,
            );
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);

            const admin = this.usersRepository.create({
                email: 'admin@nightshop.com',
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                phoneNumber: '1234567890',
                dni: 'ADMIN001',
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
            });

            await this.usersRepository.save(admin);
            this.logger.log('Usuario administrador creado exitosamente');
        } else {
            this.logger.log(
                'El usuario administrador ya existe, omitiendo creación',
            );
        }
    }
}
