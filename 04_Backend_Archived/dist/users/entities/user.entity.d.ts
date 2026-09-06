import { Ride } from '../../rides/entities/ride.entity';
export declare class User {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    is_verified: boolean;
    created_at: Date;
    rides: Ride[];
}
