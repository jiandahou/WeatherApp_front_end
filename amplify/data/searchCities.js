import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { query, limit = 10 } = ctx.args;
  
  // 设置最大限制，防止返回过多数据
  const maxLimit = 50; // 最多返回50条
  const safeLimit = Math.min(limit, maxLimit);
  
  // 如果查询字符串太短，限制返回数量
  const adjustedLimit = query.length <= 2 ? Math.min(safeLimit, 10) : safeLimit;
  
  return {
    version: '2018-05-29',
    operation: 'GET',
    path: '/city/_search',
    params: {
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        // 添加超时设置
        timeout: '5s',
        query: {
          bool: {
            should: [
              // 精确匹配 (最高权重)
              {
                term: {
                  'name.keyword': {
                    value: query,
                    boost: 10.0
                  }
                }
              },
              // 前缀匹配
              {
                prefix: {
                  'name.keyword': {
                    value: query,
                    boost: 5.0
                  }
                }
              },
              // 模糊文本匹配（只在查询长度>=3时使用）
              ...(query.length >= 3 ? [{
                match: {
                  name: {
                    query: query,
                    fuzziness: 'AUTO',
                    boost: 2.0,
                    minimum_should_match: '75%' // 提高匹配精度
                  }
                }
              }] : []),
              // 自动补全（只在有suggest字段时使用）
              {
                completion: {
                  'name.suggest': {
                    prefix: query,
                    skip_duplicates: true,
                    size: adjustedLimit // 限制补全结果数量
                  }
                }
              }
            ],
            minimum_should_match: 1,
            // 添加过滤条件，提高性能
            filter: [
              {
                exists: {
                  field: 'name'
                }
              }
            ]
          }
        },
        // 限制返回数量
        size: adjustedLimit,
        // 优化排序
        sort: [
          '_score',
          {
            'name.keyword': {
              order: 'asc'
            }
          }
        ],
        // 只返回需要的字段，减少数据传输
        _source: [
          'name',
          'lat', 
          'lng',
          'country',
          'admin1',
          'admin2'
        ],
        // 添加最小分数阈值，过滤低相关性结果
        min_score: 0.1
      }
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  
  const hits = ctx.result.hits.hits || [];
  
  // 额外的客户端过滤，确保结果质量
  const filteredResults = hits
    .filter(hit => {
      // 确保必要字段存在
      return hit._source && 
             hit._source.name && 
             hit._source.lat !== null && 
             hit._source.lng !== null &&
             hit._source.country;
    })
    .map(hit => ({
      name: hit._source.name,
      lat: parseFloat(hit._source.lat),
      lng: parseFloat(hit._source.lng), 
      country: hit._source.country,
      admin1: hit._source.admin1 || '',
      admin2: hit._source.admin2 || '',
      score: hit._score
    }))
    // 按分数和名称排序
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });
  
  // 最终限制返回数量（双重保险）
  return filteredResults.slice(0, 10);
}