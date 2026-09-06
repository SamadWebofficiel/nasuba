const Jimp = require('jimp');

async function processImage() {
  const imagePath = 'c:\\Users\\USER\\Nouveau dossier\\03_Mobile_App\\assets\\images\\logo.jpg';
  const outPath1 = 'c:\\Users\\USER\\Nouveau dossier\\03_Mobile_App\\assets\\images\\logo.png';
  const outPath2 = 'c:\\Users\\USER\\Nouveau dossier\\05_Admin_Dashboard\\src\\assets\\logo.png';

  try {
    const image = await Jimp.read(imagePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If pixel is close to white, make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // alpha
      }
    });

    await image.writeAsync(outPath1);
    await image.writeAsync(outPath2);
    console.log('Logo processed successfully');
  } catch (err) {
    console.error(err);
  }
}

processImage();
