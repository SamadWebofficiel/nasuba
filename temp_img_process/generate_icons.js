const Jimp = require('jimp');
const fs = require('fs');

async function processIcon() {
  const inputPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\a7eb83b0-25f0-49f8-846f-7a1586367a2b\\.user_uploaded\\media_1787583005608.png';
  const outputPath1 = 'C:\\Users\\USER\\Nouveau dossier\\03_Mobile_App\\assets\\icon.png';
  const outputPath2 = 'C:\\Users\\USER\\Nouveau dossier\\06_Mobile_Driver\\assets\\icon.png';

  try {
    const image = await Jimp.read(inputPath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    // Create a 1024x1024 white background square
    const size = 1024;
    const square = new Jimp(size, size, '#FFFFFF');

    // Scale the logo to fit within 800x800 so it has some padding
    image.scaleToFit(800, 800);
    
    // Composite the logo onto the center of the square
    const x = (size - image.bitmap.width) / 2;
    const y = (size - image.bitmap.height) / 2;
    square.composite(image, x, y);

    await square.writeAsync(outputPath1);
    await square.writeAsync(outputPath2);
    console.log('App icons generated successfully');
  } catch (err) {
    console.error('Error:', err);
  }
}

processIcon();
