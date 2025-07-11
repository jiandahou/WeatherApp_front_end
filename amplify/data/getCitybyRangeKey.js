import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { rangeKey } = ctx.arguments;

  if (!rangeKey || rangeKey.trim().length === 0) {
    return ddb.scan({ limit: 0 });
  }

  const searchTerm = rangeKey.trim();

  // Using the simplified ddb utility syntax
  return ddb.scan({
    filter: { rangeKey: { contains: searchTerm } },
    limit: 50
  });
}

export function response(ctx) {
  const { error, result } = ctx;

  if (error) {
    return [];
  }

  if (!result || !result.items) {
    return [];
  }

  // 使用 forEach 替代 for 循环
  const items = [];
  result.items.forEach(function(item) {
    if (typeof item.rangeKey === 'string') {
      items.push(item);
    }
  });
  
  return items.slice(0, 5);
}