"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let RidesGateway = class RidesGateway {
    server;
    activeDrivers = new Map();
    handleConnection(client) {
        console.log(`Client connecté : ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client déconnecté : ${client.id}`);
        this.activeDrivers.delete(client.id);
        this.broadcastActiveDrivers();
    }
    handleDriverLocation(data, client) {
        this.activeDrivers.set(client.id, {
            driverId: data.driverId,
            lat: data.lat,
            lng: data.lng,
        });
        this.broadcastActiveDrivers();
    }
    handleRequestRide(data, client) {
        console.log(`Nouvelle demande de course de ${data.userId}`);
        this.server.emit('newRideRequest', data);
    }
    broadcastActiveDrivers() {
        this.server.emit('activeDrivers', Array.from(this.activeDrivers.values()));
    }
};
exports.RidesGateway = RidesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RidesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('driverLocationUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RidesGateway.prototype, "handleDriverLocation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestRide'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RidesGateway.prototype, "handleRequestRide", null);
exports.RidesGateway = RidesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], RidesGateway);
//# sourceMappingURL=rides.gateway.js.map