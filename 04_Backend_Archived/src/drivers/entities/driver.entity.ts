import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Ride } from '../../rides/entities/ride.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone_number: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  license_number: string;

  @Column()
  car_plate: string;

  @Column()
  car_model: string;

  @Column()
  car_color: string;

  @Column({ default: false })
  is_online: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'float', default: 5.0 })
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Ride, ride => ride.driver)
  rides: Ride[];
}
