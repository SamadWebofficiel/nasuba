import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private activeDrivers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleDriverLocation(data: {
        lat: number;
        lng: number;
        driverId: string;
    }, client: Socket): void;
    handleRequestRide(data: {
        originLat: number;
        originLng: number;
        userId: string;
    }, client: Socket): void;
    private broadcastActiveDrivers;
}
