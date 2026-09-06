import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Driver } from '../../drivers/entities/driver.entity';

export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.rides)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Driver, driver => driver.rides, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({
    type: 'varchar',
    default: RideStatus.PENDING,
  })
  status: RideStatus;

  @Column({ type: 'float' })
  origin_lat: number;

  @Column({ type: 'float' })
  origin_lng: number;

  @Column({ type: 'float' })
  dest_lat: number;

  @Column({ type: 'float' })
  dest_lng: number;

  @Column({ type: 'float' })
  estimated_price: number;

  @Column({ type: 'float', nullable: true })
  final_price: number;

  @CreateDateColumn()
  requested_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;
}
