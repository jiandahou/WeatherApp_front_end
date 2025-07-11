import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * DynamoDB resolver for getting cities by country
 * @param {Object} ctx - The context object containing request information
 * @returns {Object} - The DynamoDB query request
 */
export function request(ctx) {
  const { country } = ctx.arguments;
  
  if (!country || country.trim().length === 0) {
    return ddb.scan({
      limit: 0
    });
  }
  
  return ddb.scan({
    filter: {
      expression: '#country = :country',
      expressionNames: {
        '#country': 'country'
      },
      expressionValues: {
        ':country': { S: country.trim() }  // DynamoDB 字符串格式
      }
    },
    limit: 100
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
  
  const items = result.items.sort((a, b) => {
    return a.rangeKey.localeCompare(b.rangeKey);
  });
  
  return items.slice(0, 20);
}
