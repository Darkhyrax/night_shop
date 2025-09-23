import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email, dni, password } = createUserDto;

        // Check if user exists by email
        const userByEmail = await this.usersRepository.findOne({ where: { email } });
        if (userByEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if user exists by username
        const userByUserName = await this.usersRepository.findOne({ where: { username: createUserDto.username } })
        if (userByUserName) {
            throw new ConflictException('Username already exists');
        }

        // Check if user exists by DNI
        const userByDni = await this.usersRepository.findOne({ where: { dni } });
        if (userByDni) {
            throw new ConflictException('DNI already exists');
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with email "${email}" not found`);
        }
        return user;
    }

    async findByUsername(username: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException(`User with username "${username}" not found`);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // If email is being updated, check if it already exists
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const userByEmail = await this.usersRepository.findOne({
                where: { email: updateUserDto.email }
            });
            if (userByEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // If username is being updated, check if it already exists
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const userByUserName = await this.usersRepository.findOne({
                where: { username: updateUserDto.username }
            });
            if (userByUserName) {
                throw new ConflictException('Username already exists');
            }
        }

        // If DNI is being updated, check if it already exists
        if (updateUserDto.dni && updateUserDto.dni !== user.dni) {
            const userByDni = await this.usersRepository.findOne({
                where: { dni: updateUserDto.dni }
            });
            if (userByDni) {
                throw new ConflictException('DNI already exists');
            }
        }

        // If password is being updated, hash it
        if (updateUserDto.password) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
        }

        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
    }
}
