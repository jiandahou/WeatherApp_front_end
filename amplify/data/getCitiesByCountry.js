import { util } from '@aws-appsync/utils';

/**
 * DynamoDB resolver for getting cities by country
 * @param {Object} ctx - The context object containing request information
 * @returns {Object} - The DynamoDB query request
 */
export function request(ctx) {
  const { country } = ctx.arguments;
  
  if (country && country.length > 0) {
    return {
      operation: 'Scan',
      filter: {
        expression: '#country = :country',
        expressionNames: {
          '#country': 'country'
        },
        expressionValues: {
          ':country': { S: country.toUpperCase() }
        }
      },
      limit: 50
    };
  }
  
  return {
    operation: 'Scan',
    limit: 0
  };
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
  
  // 按城市名称排序
  const items = result.items || [];
  return items.sort((a, b) => {
    return a.rangeKey.localeCompare(b.rangeKey);
  });
}
