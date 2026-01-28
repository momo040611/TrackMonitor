import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
