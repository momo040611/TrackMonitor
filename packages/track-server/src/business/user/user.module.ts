import { Module, forwardRef } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { DatabaseModule } from '../../storage/database/database.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
