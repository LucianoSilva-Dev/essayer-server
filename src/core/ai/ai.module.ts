import { Global, Module } from '@nestjs/common';
import { AI_PROVIDER } from './ai.constants';
import { VercelAiProvider } from './providers/vercel-ai.provider';

@Global()
@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      useClass: VercelAiProvider,
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
