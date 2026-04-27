const axios = require('axios');
const fs = require('fs');

async function downloadImage() {
  const url = 'https://thecollegefever.com/content/images/college/TIET.jpg';
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) width' }
    });
    
    response.data.pipe(fs.createWriteStream('./public/thapar-main.jpg'));
    
    await new Promise((resolve, reject) => {
      response.data.on('end', () => resolve());
      response.data.on('error', err => reject(err));
    });
    console.log('Image locally downloaded to public/thapar-main.jpg');
  } catch (error) {
    console.error('Error downloading:', error.message);
  }
}

downloadImage();
