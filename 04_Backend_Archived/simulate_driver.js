const { io } = require('socket.io-client');

// Connexion au serveur WebSocket local
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

const driverId = 'driver-sim-123';
// Centre approximatif de Parakou
let currentLat = 9.3496;
let currentLng = 2.6180;

socket.on('connect', () => {
  console.log(`✅ Chauffeur simulé connecté au serveur avec l'ID: ${socket.id}`);
  console.log(`🚗 Démarrage de la simulation de mouvement dans Parakou...`);

  // Simulation de mouvement toutes les 2 secondes
  setInterval(() => {
    // Petit déplacement aléatoire pour simuler la conduite
    const deltaLat = (Math.random() - 0.5) * 0.001; 
    const deltaLng = (Math.random() - 0.5) * 0.001;
    
    currentLat += deltaLat;
    currentLng += deltaLng;

    // Envoi de la position au serveur
    socket.emit('driverLocationUpdate', {
      driverId: driverId,
      lat: currentLat,
      lng: currentLng,
    });

    console.log(`📍 Position mise à jour : [Lat: ${currentLat.toFixed(5)}, Lng: ${currentLng.toFixed(5)}]`);
  }, 2000); // 2000 ms = 2 secondes
});

socket.on('disconnect', () => {
  console.log('❌ Déconnecté du serveur.');
});
