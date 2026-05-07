import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from './amplify/data/resource';
import * as fs from 'fs';
import * as path from 'path';

import amplifyOutputs from './amplify_outputs.json';

Amplify.configure(amplifyOutputs);

const client = generateClient<Schema>({ authMode: 'apiKey' });

interface CityData {
  name: string;
  lat: number;
  lng: number;
  country: string;
  admin1?: string;
  admin2?: string;
}

interface MigrationResult {
  success: boolean;
  city: string;
  error?: any;
  retryCount?: number;
}

class CityMigrator {
  private batchSize = 25;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createCityWithRetry(city: CityData, retryCount = 0): Promise<MigrationResult> {
    try {
      await client.models.City.create({
        name: city.name,
        lat: city.lat,
        lng: city.lng,
        country: city.country,
        admin1: city.admin1 || '',
        admin2: city.admin2 || '',
      });

      return { success: true, city: city.name };
    } catch (error: any) {
      console.error(`❌ Failed to create city (attempt ${retryCount + 1}): ${city.name}`, error.message);
      
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying city: ${city.name}`);
        await this.sleep(this.retryDelay * (retryCount + 1)); // incremental delay
        return this.createCityWithRetry(city, retryCount + 1);
      }
      
      return { success: false, city: city.name, error, retryCount };
    }
  }

  async migrate() {
    console.log('🚀 Starting city data migration...');
    
    try {
      // Load data
      const citiesPath = path.join(__dirname, 'app', 'cities.json');
      if (!fs.existsSync(citiesPath)) {
        throw new Error(`Cities data file not found: ${citiesPath}`);
      }

      const citiesData: CityData[] = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
      console.log(`📊 Total cities to migrate: ${citiesData.length}`);

      // Validate data
      const invalidCities = citiesData.filter(city => 
        !city.name || !city.lat || !city.lng || !city.country
      );
      
      if (invalidCities.length > 0) {
        console.warn(`⚠️  Found ${invalidCities.length} invalid city records, skipping`);
      }

      const validCities = citiesData.filter(city => 
        city.name && city.lat && city.lng && city.country
      );

      let successCount = 0;
      let errorCount = 0;
      const failedCities: string[] = [];

      // Process in batches
      for (let i = 0; i < validCities.length; i += this.batchSize) {
        const batch = validCities.slice(i, i + this.batchSize);
        const batchNumber = Math.floor(i / this.batchSize) + 1;
        const totalBatches = Math.ceil(validCities.length / this.batchSize);
        
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} cities)`);

        // Process batch in parallel
        const results = await Promise.allSettled(
          batch.map(city => this.createCityWithRetry(city))
        );

        // Tally results
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              successCount++;
            } else {
              errorCount++;
              failedCities.push(result.value.city);
            }
          } else {
            errorCount++;
            failedCities.push(batch[index].name);
          }
        });

        // Show progress
        const progress = Math.round(((i + batch.length) / validCities.length) * 100);
        console.log(`✅ Batch ${batchNumber} done - Progress: ${progress}% (success: ${successCount}, failed: ${errorCount})`);

        // Delay between batches
        if (i + this.batchSize < validCities.length) {
          await this.sleep(200);
        }
      }

      // Print final summary
      console.log('\n🎉 Migration complete!');
      console.log(`📈 Summary:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`   📊 Success rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

      // Save failed cities list
      if (failedCities.length > 0) {
        const failedCitiesPath = path.join(__dirname, 'failed_cities.json');
        fs.writeFileSync(failedCitiesPath, JSON.stringify(failedCities, null, 2));
        console.log(`📄 Failed cities saved to: ${failedCitiesPath}`);
      }

    } catch (error) {
      console.error('💥 Critical error during migration:', error);
      throw error;
    }
  }
}

// Run migration
const migrator = new CityMigrator();
migrator.migrate()
  .then(() => {
    console.log('✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });