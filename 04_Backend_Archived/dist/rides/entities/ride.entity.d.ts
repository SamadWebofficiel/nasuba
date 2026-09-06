import { User } from '../../users/entities/user.entity';
import { Driver } from '../../drivers/entities/driver.entity';
export declare enum RideStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Ride {
    id: string;
    user: User;
    driver: Driver;
    status: RideStatus;
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    estimated_price: number;
    final_price: number;
    requested_at: Date;
    completed_at: Date;
}
