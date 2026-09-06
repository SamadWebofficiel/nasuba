import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RidesModule } from './rides/rides.module';
import { User } from './users/entities/user.entity';
import { Driver } from './drivers/entities/driver.entity';
import { Ride } from './rides/entities/ride.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User, Driver, Ride],
      synchronize: true,
    }),
    UsersModule, 
    RidesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
