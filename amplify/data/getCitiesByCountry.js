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
  
  // 简单实现：直接返回结果，不进行复杂排序
  return items.slice(0, 10);
}
