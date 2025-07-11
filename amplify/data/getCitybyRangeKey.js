import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  // 最简实现：只扫描1条记录用于测试
  return ddb.scan({ limit: 1 });
  
  // 以下是完整实现，先注释掉以便部署
  /*
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
  */
}

export function response(ctx) {
  // 最简实现：直接返回结果
  return ctx.result?.items || [];
  
  // 以下是完整实现，先注释掉以便部署
  /*
  const { error, result } = ctx;

  if (error) {
    return [];
  }

  if (!result || !result.items) {
    return [];
  }

  // 只保留有 rangeKey 字段的城市
  const items = result.items.filter(item => typeof item.rangeKey === 'string');
  const searchTerm = (ctx.arguments.rangeKey || '').trim().toLowerCase();

  const sortedItems = items.sort((a, b) => {
    const aName = (a.rangeKey || '').toLowerCase();
    const bName = (b.rangeKey || '').toLowerCase();

    if (aName === searchTerm && bName !== searchTerm) return -1;
    if (bName === searchTerm && aName !== searchTerm) return 1;

    const aStartsWith = aName.startsWith(searchTerm);
    const bStartsWith = bName.startsWith(searchTerm);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;

    const aIndex = aName.indexOf(searchTerm);
    const bIndex = bName.indexOf(searchTerm);
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
    if (aIndex !== -1 && bIndex === -1) return -1;
    if (bIndex !== -1 && aIndex === -1) return 1;

    return aName.localeCompare(bName);
  });

  return sortedItems.slice(0, 5);
  */
}