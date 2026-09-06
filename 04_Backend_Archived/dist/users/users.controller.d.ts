import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: string;
            phone_number: string;
            first_name: string;
            last_name: string;
            email: string;
            is_verified: boolean;
            created_at: Date;
            rides: import("../rides/entities/ride.entity").Ride[];
        };
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        message: string;
        user: {
            id: string;
            phone_number: string;
            first_name: string;
            last_name: string;
            email: string;
            is_verified: boolean;
            created_at: Date;
            rides: import("../rides/entities/ride.entity").Ride[];
        };
        token: string;
    }>;
}
