const fs = require('fs');
const path = require('path');

// Basic dotenv parser for .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const driveFileId = '1EZHNJ_2Aq59cB5PhuaKq0KD-q6qd42tC';
const body = {
  title: 'Abdülkadir Geylani - Atiyye-i Subhaniye',
  author: 'Abdülkadir Geylani',
  cover_url: 'https://images.unsplash.com/photo-1542871793-27e0fa0ce231?q=80&w=400',
  drive_file_id: driveFileId
};

fetch(`${supabaseUrl}/rest/v1/books`, {
  method: 'POST',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(body)
})
.then(res => res.json())
.then(data => {
  if (data.error || data.code) console.error('Error:', data);
  else console.log('Successfully inserted:', data);
})
.catch(err => console.error('Fetch error:', err));
