import { Global, Module } from '@nestjs/common';
import { UserFactRepository } from './user-fact.repository.js';

@Global()
@Module({
  providers: [UserFactRepository],
  exports: [UserFactRepository],
})
export class PostgresModule {}
