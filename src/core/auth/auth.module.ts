import { Global, Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';

@Global()
@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
    }),
  ],
  exports: [BetterAuthModule],
})
export class AuthModule {}
