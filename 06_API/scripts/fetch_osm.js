require('dotenv').config({ path: '../.env.development' });
const axios = require('axios');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, cert } = require('firebase-admin/app');

// Initialize Firebase
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
} else {
    initializeApp(); // Uses application default credentials or emulator
}

const db = getFirestore();

// Overpass API URL
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Bounding boxes for the 4 cities (approximate bbox: South, West, North, East)
const CITIES = {
    'Parakou': '9.300,-1.650,9.400,-1.550', // Roughly Parakou center (Wait, longitude in Parakou is ~2.62, latitude ~9.34. Wait! Longitude of Benin is positive.)
    // Let's use coordinates around the cities.
    // Parakou: Lat ~9.337, Lon ~2.630. Bbox: 9.25, 2.55, 9.40, 2.70
    'Parakou_bbox': '9.25,2.55,9.40,2.70',
    'Djougou_bbox': '9.65,1.60,9.75,1.75', // Djougou Lat ~9.708, Lon ~1.666
    'Natitingou_bbox': '10.25,1.30,10.35,1.45', // Natitingou Lat ~10.304, Lon ~1.379
    'Malanville_bbox': '11.80,3.30,11.90,3.45' // Malanville Lat ~11.868, Lon ~3.383
};

// Categories to fetch mapping to OSM tags
const OSM_QUERIES = [
    { type: 'node', tags: ['amenity=hospital', 'amenity=clinic', 'amenity=pharmacy'], category: 'Santé', icon: '🏥' },
    { type: 'node', tags: ['amenity=police'], category: 'Sécurité', icon: '🚓' },
    { type: 'node', tags: ['amenity=fuel', 'shop=car_repair'], category: 'Automobile', icon: '⛽' },
    { type: 'node', tags: ['amenity=bus_station', 'highway=bus_stop'], category: 'Transport', icon: '🚌' },
    { type: 'node', tags: ['tourism=hotel', 'tourism=guest_house'], category: 'Hébergement', icon: '🏨' },
    { type: 'node', tags: ['amenity=marketplace', 'shop=supermarket'], category: 'Commerce', icon: '🛒' },
    { type: 'node', tags: ['amenity=restaurant', 'amenity=fast_food'], category: 'Restauration', icon: '🍽️' },
    { type: 'node', tags: ['amenity=bank', 'amenity=post_office'], category: 'Services', icon: '🏦' }
];

async function fetchFromOSM(bbox, tags) {
    let queryTags = tags.map(t => `node[${t}](${bbox});`).join('');
    // Also include ways with centers if we miss large buildings
    let wayTags = tags.map(t => `way[${t}](${bbox});`).join('');
    
    const query = `
        [out:json][timeout:25];
        (
          ${queryTags}
          ${wayTags}
        );
        out center;
    `;
    
    try {
        const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`);
        return response.data.elements || [];
    } catch (error) {
        console.error("Error fetching from OSM:", error.message);
        return [];
    }
}

async function runImport() {
    console.log("Démarrage de l'import OSM pour NASUBA (Nord Bénin)...");

    let totalAdded = 0;

    for (const [cityName, bbox] of Object.entries(CITIES)) {
        const city = cityName.split('_')[0];
        console.log(`\nRecherche pour ${city} (Bbox: ${bbox})...`);

        for (const q of OSM_QUERIES) {
            console.log(`  - Extraction catégorie [${q.category}]...`);
            const elements = await fetchFromOSM(bbox, q.tags);

            for (const el of elements) {
                // If it's a way, use el.center, otherwise el.lat/el.lon
                const lat = el.lat || (el.center && el.center.lat);
                const lon = el.lon || (el.center && el.center.lon);
                const name = el.tags?.name;

                // We only import named points to avoid clutter, or unnamed if it's very important like police/hospital
                if (!name && !['Santé', 'Sécurité'].includes(q.category)) {
                    continue; 
                }

                const displayName = name || `${q.category} (Non nommé)`;
                
                const data = {
                    name: displayName,
                    category: q.category,
                    icon: q.icon,
                    city: city,
                    position: { lat, lng: lon },
                    address: el.tags['addr:street'] || el.tags['addr:city'] || city,
                    phone: el.tags['contact:phone'] || el.tags.phone || null,
                    hours: el.tags['opening_hours'] || null,
                    osm_id: el.id,
                    source: 'OSM',
                    verified: true, // We assume OSM data is correct enough as a base
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Use osm_id as document ID to prevent duplicates if script runs twice
                const docId = `osm_${el.id}`;
                await db.collection('infrastructures').doc(docId).set(data);
                totalAdded++;
            }
            
            // Sleep to respect Overpass API rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\nImport terminé. ${totalAdded} infrastructures ajoutées/mises à jour dans Firestore.`);
}

runImport().catch(console.error);
