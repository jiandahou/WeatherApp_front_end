import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { country } = ctx.arguments;
  
  if (!country || country.trim().length === 0) {
    return ddb.scan({ limit: 0 });
  }
  
  // Using the ddb utility for cleaner syntax
  return ddb.scan({
    filter: { country: { eq: country.trim() } },
    limit: 50
  });
}

export function response(ctx) {
  if (ctx.error) {
    util.error(`Error processing request: ${ctx.error.message}`, 'CustomErrorType');
    return [];
  }
  
  const items = ctx.result?.items || [];
  
  // Make sure to check if the property exists before sorting
  const sortedItems = items.sort((a, b) => {
    // Use a property that definitely exists in your items
    // Replace 'name' with whatever property you want to sort by
    const aValue = (a.name || '').toLowerCase();
    const bValue = (b.name || '').toLowerCase();
    return aValue.localeCompare(bValue);
  });
  
  return sortedItems.slice(0, 10);
}
