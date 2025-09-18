const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'uscities.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV manually (to avoid extra dependencies)
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

// Find column indices
const cityIndex = headers.indexOf('city');
const stateIndex = headers.indexOf('state_id');
const stateNameIndex = headers.indexOf('state_name');
const countyIndex = headers.indexOf('county_name');
const populationIndex = headers.indexOf('population');

// Process cities
const cities = [];
const citiesSet = new Set(); // To avoid duplicates

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Simple CSV parsing (handles basic cases)
  const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
  
  if (columns.length > stateIndex) {
    const city = columns[cityIndex]?.replace(/"/g, '').trim();
    const stateId = columns[stateIndex]?.replace(/"/g, '').trim();
    const stateName = columns[stateNameIndex]?.replace(/"/g, '').trim();
    const county = columns[countyIndex]?.replace(/"/g, '').trim();
    const population = parseInt(columns[populationIndex]?.replace(/"/g, '').trim() || '0');
    
    if (city && stateId) {
      const cityString = `${city}, ${stateId}`;
      
      // Avoid duplicates
      if (!citiesSet.has(cityString)) {
        citiesSet.add(cityString);
        cities.push({
          city,
          state: stateId,
          stateName,
          county,
          population,
          formatted: cityString
        });
      }
    }
  }
}

// Sort by population (largest first) for better search results
cities.sort((a, b) => b.population - a.population);

// Create the TypeScript file content
const tsContent = `// Auto-generated file containing all US cities
// Source: SimpleMaps US Cities Database
// Generated on: ${new Date().toISOString()}

export interface USCity {
  city: string;
  state: string;
  stateName: string;
  county: string;
  population: number;
  formatted: string;
}

export const ALL_US_CITIES: USCity[] = ${JSON.stringify(cities, null, 2)};

// Pre-formatted strings for faster searching
export const ALL_US_CITIES_FORMATTED: string[] = [
${cities.map(c => `  "${c.formatted}"`).join(',\n')}
];

// Helper function to search cities
export function searchCities(query: string, limit: number = 10): string[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: { city: string; score: number }[] = [];
  
  for (const city of ALL_US_CITIES) {
    const lowerCity = city.city.toLowerCase();
    const lowerState = city.state.toLowerCase();
    const formatted = city.formatted.toLowerCase();
    
    let score = 0;
    
    // Exact match gets highest score
    if (formatted === lowerQuery) {
      score = 1000;
    }
    // City starts with query
    else if (lowerCity.startsWith(lowerQuery)) {
      score = 100 - (city.city.length - query.length);
    }
    // City contains query
    else if (lowerCity.includes(lowerQuery)) {
      score = 50 - (city.city.length - query.length);
    }
    // Formatted string contains query
    else if (formatted.includes(lowerQuery)) {
      score = 25;
    }
    
    // Boost score by population (more populated cities appear first)
    if (score > 0) {
      score += Math.log10(city.population + 1);
      results.push({ city: city.formatted, score });
    }
    
    // Early exit if we have enough high-quality results
    if (results.length > limit * 3) {
      break;
    }
  }
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.city);
}
`;

// Write the TypeScript file
const outputPath = path.join(__dirname, '..', 'lib', 'us-cities-data.ts');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, tsContent);

console.log(`✅ Successfully converted ${cities.length} cities`);
console.log(`📁 Output saved to: lib/us-cities-data.ts`);
console.log(`📊 File size: ${(Buffer.byteLength(tsContent) / 1024 / 1024).toFixed(2)} MB`);