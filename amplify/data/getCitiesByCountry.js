import { util } from '@aws-appsync/utils';

/**
 * DynamoDB resolver for getting cities by country
 */
export function request(ctx) {
  const { country } = ctx.arguments;
  if (!country || country.trim().length === 0) {
    return {
      operation: 'Scan',
      limit: 0
    };
  }
  return {
    operation: 'Scan',
    filter: {
      expression: '#country = :country',
      expressionNames: {
        '#country': 'country'
      },
      expressionValues: {
        ':country': { S: country.trim() }
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
  const sortedItems = items.sort((a, b) => {
    const aName = (a.rangeKey || '').toLowerCase();
    const bName = (b.rangeKey || '').toLowerCase();
    return aName.localeCompare(bName);
  });
  return sortedItems.slice(0, 10);
}
