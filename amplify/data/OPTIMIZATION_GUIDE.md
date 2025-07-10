# 针对现有 DynamoDB 表的城市搜索优化指南

## 当前情况分析
- ✅ 代码可以正常工作（使用 Scan 操作）
- ⚠️ 性能可能不是最优（因为 rangeKey 不是主键）
- ✅ 不需要数据迁移

## 代码兼容性
您的代码完全可以使用，因为：
1. 我们使用 `Scan` 操作来搜索非主键字段
2. DynamoDB 支持对任意字段进行过滤
3. 搜索逻辑已经优化，支持多种匹配模式

## 性能优化建议

### 1. 创建 GSI (Global Secondary Index)
如果您的表数据量很大，建议为 `rangeKey` 字段创建 GSI：

```json
{
  "IndexName": "rangeKey-index",
  "KeySchema": [
    {
      "AttributeName": "rangeKey",
      "KeyType": "HASH"
    }
  ],
  "Projection": {
    "ProjectionType": "ALL"
  }
}
```

### 2. 如果创建了 GSI，可以使用这个优化版本：

```javascript
// 使用 GSI 的优化版本
export function request(ctx) {
  const { cityName } = ctx.arguments;
  
  if (!cityName || cityName.trim().length === 0) {
    return {
      operation: 'Scan',
      limit: 0
    };
  }
  
  const searchTerm = cityName.trim();
  
  // 精确匹配使用 Query（需要 GSI）
  if (searchTerm.length > 0) {
    return {
      operation: 'Query',
      index: 'rangeKey-index',
      query: {
        expression: '#rangeKey = :rangeKey',
        expressionNames: {
          '#rangeKey': 'rangeKey'
        },
        expressionValues: {
          ':rangeKey': { S: searchTerm }
        }
      },
      limit: 50
    };
  }
  
  // 模糊搜索仍然使用 Scan
  return {
    operation: 'Scan',
    filter: {
      expression: 'contains(#rangeKey, :searchTerm)',
      expressionNames: {
        '#rangeKey': 'rangeKey'
      },
      expressionValues: {
        ':searchTerm': { S: searchTerm }
      }
    },
    limit: 50
  };
}
```

## 当前代码的使用方式

### 1. 模糊搜索城市名称
```javascript
// 搜索包含 "Beijing" 的城市
const cities = await client.queries.searchCitiesByName({
  cityName: "Beijing"
});
```

### 2. 精确匹配（通过 rangeKey）
```javascript
// 搜索 rangeKey 为 "Beijing" 的城市
const cities = await client.queries.getCitbyRangeKey({
  rangeKey: "Beijing"
});
```

### 3. 按国家搜索
```javascript
// 搜索中国的城市
const cities = await client.queries.getCitiesByCountry({
  country: "CN"
});
```

## 数据格式要求
您的表应该包含以下字段：
```json
{
  "hashKey": "string",      // 您的实际主键
  "rangeKey": "string",     // 城市名称（搜索字段）
  "admin1": "string",       // 行政区1
  "admin2": "string",       // 行政区2
  "country": "string",      // 国家代码
  "geoHash": "string",      // 地理哈希（可选）
  "latitude": "number",     // 纬度
  "longitude": "number"     // 经度
}
```

## 性能监控
监控以下指标：
- 查询延迟
- 消耗的 RCU (Read Capacity Units)
- 返回的项目数量

## 成本优化
- 使用 `limit` 参数限制返回结果
- 考虑实现客户端缓存
- 如果查询频繁，考虑使用 DynamoDB Accelerator (DAX)

## 故障排除
如果搜索没有返回结果，检查：
1. 字段名称是否正确（`rangeKey`）
2. 数据是否存在于表中
3. 权限配置是否正确
4. 区域设置是否正确
