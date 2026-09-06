import { Module } from '@nestjs/common';
import { RidesGateway } from './rides.gateway';

@Module({
  providers: [RidesGateway],
})
export class RidesModule {}
