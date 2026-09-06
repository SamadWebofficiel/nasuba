import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Stockage en mémoire simple pour l'exemple (en production: Redis)
  private activeDrivers: Map<string, any> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté : ${client.id}`);
    this.activeDrivers.delete(client.id);
    this.broadcastActiveDrivers();
  }

  @SubscribeMessage('driverLocationUpdate')
  handleDriverLocation(
    @MessageBody() data: { lat: number; lng: number; driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Mettre à jour la position du chauffeur
    this.activeDrivers.set(client.id, {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
    });

    // Diffuser à tout le monde (ou à une room spécifique)
    this.broadcastActiveDrivers();
  }

  @SubscribeMessage('requestRide')
  handleRequestRide(
    @MessageBody() data: { originLat: number; originLng: number; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Nouvelle demande de course de ${data.userId}`);
    // Émettre aux chauffeurs proches
    this.server.emit('newRideRequest', data);
  }

  private broadcastActiveDrivers() {
    this.server.emit('activeDrivers', Array.from(this.activeDrivers.values()));
  }
}
