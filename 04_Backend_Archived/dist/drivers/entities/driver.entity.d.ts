import { Ride } from '../../rides/entities/ride.entity';
export declare class Driver {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    license_number: string;
    car_plate: string;
    car_model: string;
    car_color: string;
    is_online: boolean;
    is_verified: boolean;
    rating: number;
    created_at: Date;
    rides: Ride[];
}
