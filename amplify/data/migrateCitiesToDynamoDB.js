import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';

/**
 * 脚本用于将 cities.json 数据导入到 DynamoDB
 * 使用方法：node migratecitiestodynamodb.js
 */

// DynamoDB 配置
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// 表名 - 请根据您的实际表名修改
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'YourCityTableName';

/**
 * 批量写入数据到 DynamoDB
 * @param {Array} items - 要写入的数据项
 */
async function batchWriteItems(items) {
  const batchSize = 25; // DynamoDB 批量写入限制
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  console.log(`总共 ${items.length} 条记录，分成 ${batches.length} 批次写入`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const putRequests = batch.map(item => ({
      PutRequest: {
        Item: item
      }
    }));

    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: putRequests
        }
      }));
      
      console.log(`批次 ${i + 1}/${batches.length} 写入成功`);
      
      // 添加延时以避免超出 DynamoDB 限制
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`批次 ${i + 1} 写入失败:`, error);
      throw error;
    }
  }
}

/**
 * 转换城市数据格式
 * @param {Object} city - 原始城市数据
 * @returns {Object} - 转换后的 DynamoDB 格式数据
 */
function transformCityData(city) {
  // 生成 hashKey 和 rangeKey
  const hashKey = `${city.country}-${city.admin1 || 'unknown'}`;
  const rangeKey = city.name;
  
  // 生成 geoHash (简单的实现，可以使用更复杂的算法)
  const geoHash = generateGeoHash(parseFloat(city.lat), parseFloat(city.lng));
  
  return {
    hashKey,
    rangeKey,
    admin1: city.admin1 || '',
    admin2: city.admin2 || '',
    country: city.country,
    geoHash,
    latitude: parseFloat(city.lat),
    longitude: parseFloat(city.lng),
    // 添加一些额外的搜索字段
    searchName: city.name.toLowerCase(),
    fullName: `${city.name}, ${city.country}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 简单的 GeoHash 生成函数
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {string} - GeoHash 字符串
 */
function generateGeoHash(lat, lng) {
  // 这是一个简化的实现，生产环境建议使用专业的 geohash 库
  const precision = 6;
  const latRange = [-90, 90];
  const lngRange = [-180, 180];
  
  let hash = '';
  let isEven = true;
  
  for (let i = 0; i < precision * 5; i++) {
    let range = isEven ? lngRange : latRange;
    let value = isEven ? lng : lat;
    
    const mid = (range[0] + range[1]) / 2;
    if (value >= mid) {
      hash += '1';
      range[0] = mid;
    } else {
      hash += '0';
      range[1] = mid;
    }
    
    isEven = !isEven;
  }
  
  return hash;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始导入城市数据到 DynamoDB...');
    
    // 读取 cities.json 文件
    const citiesPath = path.join(process.cwd(), 'app', 'cities.json');
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
    
    console.log(`读取到 ${citiesData.length} 条城市数据`);
    
    // 转换数据格式
    console.log('转换数据格式...');
    const transformedData = citiesData.map(transformCityData);
    
    // 批量写入到 DynamoDB
    console.log('开始写入 DynamoDB...');
    await batchWriteItems(transformedData);
    
    console.log('数据导入完成！');
    
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, transformCityData, batchWriteItems };
