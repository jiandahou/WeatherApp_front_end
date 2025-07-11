import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * DynamoDB resolver for fuzzy search of cities by name
 * @param {Object} ctx - The context object containing request information
 * @returns {Object} - The DynamoDB query request
 */
export function request(ctx) {
  const { cityName } = ctx.arguments;
  
  if (!cityName || cityName.trim().length === 0) {
    return ddb.scan({
      limit: 0
    });
  }
  
  const searchTerm = cityName.trim();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // 使用 DynamoDB 工具库的 scan 方法
  return ddb.scan({
    filter: {
      expression: '#rangeKey = :exactMatch OR contains(#rangeKey, :searchTerm) OR contains(#rangeKey, :lowerSearchTerm)',
      expressionNames: {
        '#rangeKey': 'rangeKey'
      },
      expressionValues: {
        ':exactMatch': { S: searchTerm },
        ':searchTerm': { S: searchTerm },
        ':lowerSearchTerm': { S: lowerSearchTerm }
      }
    },
    limit: 100  // 扫描更多结果以确保找到最相关的城市
  });
}

/**
 * Process the DynamoDB response
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
  
  // 对结果进行排序，优先显示完全匹配的结果
  const items = result.items;
  const searchTerm = ctx.arguments.cityName.toLowerCase().trim();
  
  const sortedItems = items.sort((a, b) => {
    const aName = a.rangeKey.toLowerCase();
    const bName = b.rangeKey.toLowerCase();
    
    // 完全匹配优先
    if (aName === searchTerm && bName !== searchTerm) return -1;
    if (bName === searchTerm && aName !== searchTerm) return 1;
    
    // 开头匹配优先
    const aStartsWith = aName.startsWith(searchTerm);
    const bStartsWith = bName.startsWith(searchTerm);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;
    
    // 按字母顺序排序
    return aName.localeCompare(bName);
  });
  
  // 只返回最相关的5条记录
  return sortedItems.slice(0, 5);
}
