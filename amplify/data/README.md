# 城市搜索功能 - DynamoDB 集成

这个文档说明如何将 `cities.json` 数据迁移到 DynamoDB 并使用 Amplify 进行城市搜索。

## 文件结构

- `resource.ts` - Amplify 数据模型定义
- `getCitbyRangeKey.js` - 根据 rangeKey 搜索城市的 resolver
- `searchCitiesByName.js` - 模糊搜索城市名称的 resolver
- `getCitiesByCountry.js` - 根据国家代码获取城市的 resolver
- `migrateCitiesToDynamoDB.js` - 数据迁移脚本
- `citySearchExamples.tsx` - 前端使用示例

## 数据模型

### City 类型结构
```typescript
City: {
  hashKey: string;      // 组合键：国家-行政区1
  rangeKey: string;     // 城市名称（这是主要的搜索字段）
  admin1: string;       // 行政区1
  admin2: string;       // 行政区2
  country: string;      // 国家代码
  geoHash: string;      // 地理哈希
  latitude: number;     // 纬度
  longitude: number;    // 经度
}
```

## 数据迁移

### 1. 环境变量配置
在迁移之前，请设置以下环境变量：

```bash
# Windows PowerShell
$env:AWS_REGION="us-east-1"
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:DYNAMODB_TABLE_NAME="your-table-name"
```

### 2. 运行迁移脚本
```bash
node migrateCitiesToDynamoDB.js
```

## 可用的查询功能

### 1. 根据城市名称模糊搜索
```typescript
const cities = await client.queries.searchCitiesByName({
  cityName: "Beijing"
});
```

### 2. 根据 rangeKey 精确搜索
```typescript
const cities = await client.queries.getCitbyRangeKey({
  rangeKey: "Beijing"
});
```

### 3. 根据国家代码获取城市
```typescript
const cities = await client.queries.getCitiesByCountry({
  country: "CN"
});
```

## 前端使用示例

### 基本使用
```typescript
import { searchCitiesByName } from './citySearchExamples';

// 搜索城市
const searchResults = await searchCitiesByName("Tokyo");
console.log(searchResults);
```

### 使用 React Hook
```typescript
import { useCitySearch } from './citySearchExamples';

function MyComponent() {
  const { cities, loading, error, searchCities } = useCitySearch();
  
  const handleSearch = (searchTerm: string) => {
    searchCities(searchTerm);
  };
  
  // 渲染搜索结果...
}
```

## 数据格式转换

原始 `cities.json` 格式：
```json
{
  "name": "Beijing",
  "lat": "39.9042",
  "lng": "116.4074",
  "country": "CN",
  "admin1": "22",
  "admin2": ""
}
```

转换后的 DynamoDB 格式：
```json
{
  "hashKey": "CN-22",
  "rangeKey": "Beijing",
  "admin1": "22",
  "admin2": "",
  "country": "CN",
  "geoHash": "wx4g0s",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "searchName": "beijing",
  "fullName": "Beijing, CN",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 性能优化建议

1. **索引优化**：为常用查询字段创建 GSI（全局二级索引）
2. **分页**：对于大量结果，使用分页查询
3. **缓存**：在前端实现搜索结果缓存
4. **防抖**：实现搜索输入防抖，减少查询次数

## 错误处理

所有查询函数都包含错误处理：
```typescript
try {
  const results = await searchCitiesByName(cityName);
  return results;
} catch (error) {
  console.error('搜索城市失败:', error);
  return [];
}
```

## 部署步骤

1. 确保您的 Amplify 项目已正确配置
2. 运行数据迁移脚本导入城市数据
3. 部署 Amplify 后端：`amplify push`
4. 在前端代码中使用提供的查询函数

## 注意事项

- `rangeKey` 是城市的主要名称字段
- 搜索功能支持中文和英文
- 结果按相关性排序（完全匹配 > 开头匹配 > 包含匹配）
- 每个查询都有结果数量限制，避免返回过多数据
