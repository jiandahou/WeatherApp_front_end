import { util } from '@aws-appsync/utils';

/**
 * 优化版本的城市搜索 resolver
 * 适用于 rangeKey 不是主键的情况
 * 为了提高性能，建议在 rangeKey 字段上创建 GSI (Global Secondary Index)
 */

export function request(ctx) {
  const { cityName } = ctx.arguments;
  
  if (!cityName || cityName.trim().length === 0) {
    return {
      operation: 'Scan',
      limit: 0
    };
  }
  
  const searchTerm = cityName.trim();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // 如果您的表有很多数据，建议使用并行扫描来提高性能
  return {
    operation: 'Scan',
    filter: {
      // 使用多种匹配策略
      expression: '#rangeKey = :exactMatch OR contains(#rangeKey, :searchTerm) OR contains(#rangeKey, :lowerSearchTerm) OR begins_with(#rangeKey, :searchTerm)',
      expressionNames: {
        '#rangeKey': 'rangeKey'
      },
      expressionValues: {
        ':exactMatch': { S: searchTerm },
        ':searchTerm': { S: searchTerm },
        ':lowerSearchTerm': { S: lowerSearchTerm }
      }
    },
    limit: 100,
    consistentRead: false,
    // 可选：如果表很大，可以启用并行扫描
    // segment: 0,
    // totalSegments: 4
  };
}

export function response(ctx) {
  const { error, result } = ctx;
  
  if (error) {
    util.error(error.message, error.type);
  }
  
  if (!result || !result.items) {
    return [];
  }
  
  const items = result.items;
  const searchTerm = ctx.arguments.cityName.toLowerCase().trim();
  
  // 智能排序：优先级 - 完全匹配 > 开头匹配 > 包含匹配
  return items.sort((a, b) => {
    const aName = a.rangeKey.toLowerCase();
    const bName = b.rangeKey.toLowerCase();
    
    // 1. 完全匹配优先
    if (aName === searchTerm && bName !== searchTerm) return -1;
    if (bName === searchTerm && aName !== searchTerm) return 1;
    
    // 2. 开头匹配优先
    const aStartsWith = aName.startsWith(searchTerm);
    const bStartsWith = bName.startsWith(searchTerm);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;
    
    // 3. 包含匹配按位置排序
    const aIndex = aName.indexOf(searchTerm);
    const bIndex = bName.indexOf(searchTerm);
    if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    
    // 4. 按字母顺序排序
    return aName.localeCompare(bName);
  });
}

/**
 * 性能优化建议：
 * 1. 在 rangeKey 字段上创建 GSI，这样可以使用 Query 而不是 Scan
 * 2. 如果数据量很大，考虑使用 ElasticSearch 或 CloudSearch
 * 3. 实现客户端缓存，避免重复查询
 */
