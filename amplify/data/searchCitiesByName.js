import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * DynamoDB resolver for fuzzy search of cities by name
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

export function response(ctx) {
  if (ctx.error) {
    return [];
  }
  const items = ctx.result?.items || [];
  const searchTerm = (ctx.arguments.cityName || '').trim().toLowerCase();
  const sortedItems = items.sort((a, b) => {
    const aName = (a.rangeKey || '').toLowerCase();
    const bName = (b.rangeKey || '').toLowerCase();
    if (aName === searchTerm && bName !== searchTerm) return -1;
    if (bName === searchTerm && aName !== searchTerm) return 1;
    const aStartsWith = aName.startsWith(searchTerm);
    const bStartsWith = bName.startsWith(searchTerm);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;
    return aName.localeCompare(bName);
  });
  return sortedItems.slice(0, 5);
}
