import { Module } from '@nestjs/common';

import { DatabaseModule } from '@libs/database';
@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
