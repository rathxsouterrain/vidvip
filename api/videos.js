// api/videos.js - VERSI FIX
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join('/tmp', 'videos.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Read error:', err);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Write error:', err);
  }
}

module.exports = (req, res) => {
  // CORS - PENTING!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET
  if (req.method === 'GET') {
    const videos = readData();
    res.status(200).json({ success: true, data: videos });
    return;
  }

  // POST
  if (req.method === 'POST') {
    let body = req.body;
    
    // Handle jika body belum di-parse
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    
    if (!body || !body.title || !body.poster || !body.jumpshare) {
      res.status(400).json({ success: false, error: 'Data tidak lengkap' });
      return;
    }

    const videos = readData();
    videos.push({
      id: Date.now(),
      title: String(body.title).trim(),
      poster: String(body.poster).trim(),
      jumpshare: String(body.jumpshare).trim(),
      uploadedAt: new Date().toISOString()
    });

    writeData(videos);
    res.status(200).json({ success: true, data: videos[videos.length - 1] });
    return;
  }

  // DELETE
  if (req.method === 'DELETE') {
    let body = req.body;
    
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    
    const index = parseInt(body?.index);
    
    if (isNaN(index)) {
      res.status(400).json({ success: false, error: 'Index tidak valid' });
      return;
    }

    const videos = readData();
    if (index < 0 || index >= videos.length) {
      res.status(404).json({ success: false, error: 'Video tidak ditemukan' });
      return;
    }

    videos.splice(index, 1);
    writeData(videos);
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ success: false, error: 'Method tidak diizinkan' });
};
