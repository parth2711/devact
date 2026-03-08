require('dotenv').config({path: 'C:/Users/Parth Jangir/Documents/projects/devact/.env'});
const fs = require('fs');

async function listModels() {
  const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
    .then(r => r.json());
  fs.writeFileSync('C:/Users/Parth Jangir/Documents/projects/devact/server/models.json', JSON.stringify(models.models.map(m => m.name), null, 2));
}

listModels();
