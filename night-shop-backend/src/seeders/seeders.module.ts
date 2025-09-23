import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserSeeder } from './admin-user.seeder';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AdminUserSeeder],
  exports: [AdminUserSeeder],
})
export class SeedersModule {}
