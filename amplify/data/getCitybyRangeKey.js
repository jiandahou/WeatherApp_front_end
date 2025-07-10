import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * DynamoDB resolver for searching cities by rangeKey (city name)
 * 支持精确匹配和模糊搜索
 * @param {Object} ctx - The context object containing request information
 * @returns {Object} - The DynamoDB query request
 */
export function request(ctx) {
  const { rangeKey } = ctx.arguments;
  
  if (!rangeKey || rangeKey.trim().length === 0) {
    return ddb.scan({
      limit: 0
    });
  }
  
  const searchTerm = rangeKey.trim();
  
  // 使用 DynamoDB 工具库的 scan 方法
  return ddb.scan({
    filter: {
      expression: '#rangeKey = :exactMatch OR contains(#rangeKey, :searchTerm)',
      expressionNames: {
        '#rangeKey': 'rangeKey'
      },
      expressionValues: {
        ':exactMatch': searchTerm,  // 自动处理 DynamoDB 类型转换
        ':searchTerm': searchTerm
      }
    },
    limit: 50  // 扫描更多结果以确保找到最相关的城市
  });
}

/**
 * Process the DynamoDB response and sort results by relevance
 * @param {Object} ctx - The context object containing response information
 * @returns {Array} - Array of city objects matching the search criteria
 */
export function response(ctx) {
  const { error, result } = ctx;
  
  if (error) {
    util.error(error.message, error.type);
  }
  
  if (!result || !result.items) {
    return [];
  }
  
  const items = result.items;
  const searchTerm = ctx.arguments.rangeKey.trim().toLowerCase();
  
  // 按相关性排序，然后返回最相关的5条
  const sortedItems = items.sort((a, b) => {
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
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
    if (aIndex !== -1 && bIndex === -1) return -1;
    if (bIndex !== -1 && aIndex === -1) return 1;
    
    // 4. 按字母顺序排序
    return aName.localeCompare(bName);
  });
  
  // 只返回最相关的5条记录
  return sortedItems.slice(0, 5);
}