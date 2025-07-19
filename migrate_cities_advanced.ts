import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from './amplify/data/resource';
import * as fs from 'fs';
import * as path from 'path';

import amplifyOutputs from './amplify_outputs.json';

Amplify.configure(amplifyOutputs);

const client = generateClient<Schema>();

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
  private retryDelay = 1000; // 1秒

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
      console.error(`❌ 创建城市失败 (尝试 ${retryCount + 1}): ${city.name}`, error.message);
      
      if (retryCount < this.maxRetries) {
        console.log(`🔄 重试创建城市: ${city.name}`);
        await this.sleep(this.retryDelay * (retryCount + 1)); // 递增延迟
        return this.createCityWithRetry(city, retryCount + 1);
      }
      
      return { success: false, city: city.name, error, retryCount };
    }
  }

  async migrate() {
    console.log('🚀 开始高级城市数据迁移...');
    
    try {
      // 读取数据
      const citiesPath = path.join(__dirname, 'app', 'cities.json');
      if (!fs.existsSync(citiesPath)) {
        throw new Error(`城市数据文件不存在: ${citiesPath}`);
      }

      const citiesData: CityData[] = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
      console.log(`📊 总共需要迁移 ${citiesData.length} 个城市`);

      // 验证数据
      const invalidCities = citiesData.filter(city => 
        !city.name || !city.lat || !city.lng || !city.country
      );
      
      if (invalidCities.length > 0) {
        console.warn(`⚠️  发现 ${invalidCities.length} 个无效城市数据，将跳过`);
      }

      const validCities = citiesData.filter(city => 
        city.name && city.lat && city.lng && city.country
      );

      let successCount = 0;
      let errorCount = 0;
      const failedCities: string[] = [];

      // 分批处理
      for (let i = 0; i < validCities.length; i += this.batchSize) {
        const batch = validCities.slice(i, i + this.batchSize);
        const batchNumber = Math.floor(i / this.batchSize) + 1;
        const totalBatches = Math.ceil(validCities.length / this.batchSize);
        
        console.log(`📦 处理批次 ${batchNumber}/${totalBatches} (${batch.length} 个城市)`);

        // 并行处理当前批次
        const results = await Promise.allSettled(
          batch.map(city => this.createCityWithRetry(city))
        );

        // 统计结果
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

        // 显示进度
        const progress = Math.round(((i + batch.length) / validCities.length) * 100);
        console.log(`✅ 批次 ${batchNumber} 完成 - 进度: ${progress}% (成功: ${successCount}, 失败: ${errorCount})`);

        // 批次间延迟
        if (i + this.batchSize < validCities.length) {
          await this.sleep(200);
        }
      }

      // 输出最终结果
      console.log('\n🎉 迁移完成!');
      console.log(`📈 总结:`);
      console.log(`   ✅ 成功: ${successCount}`);
      console.log(`   ❌ 失败: ${errorCount}`);
      console.log(`   📊 成功率: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

      // 保存失败的城市列表
      if (failedCities.length > 0) {
        const failedCitiesPath = path.join(__dirname, 'failed_cities.json');
        fs.writeFileSync(failedCitiesPath, JSON.stringify(failedCities, null, 2));
        console.log(`📄 失败的城市列表已保存到: ${failedCitiesPath}`);
      }

    } catch (error) {
      console.error('💥 迁移过程中发生严重错误:', error);
      throw error;
    }
  }
}

// 运行迁移
const migrator = new CityMigrator();
migrator.migrate()
  .then(() => {
    console.log('✨ 迁移脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 迁移脚本执行失败:', error);
    process.exit(1);
  });