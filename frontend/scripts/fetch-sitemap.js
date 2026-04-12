import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchSitemap() {
  const BACKEND_URL = 'https://api.theopensourcelibrary.com/sitemap.xml';
  const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

  console.log(`🚀 Fetching sitemap from ${BACKEND_URL}...`);

  try {
    const response = await axios.get(BACKEND_URL);
    fs.writeFileSync(OUTPUT_PATH, response.data);
    console.log(`✅ Sitemap saved successfully to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Failed to fetch sitemap:', error.message);
    // If it fails, we keep the existing file (or create a blank index)
  }
}

fetchSitemap();
