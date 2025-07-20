import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { query, limit = 10 } = ctx.args;

  // 设置最大限制，防止返回过多数据
  const maxLimit = 50;
  const safeLimit = Math.min(limit, maxLimit);

  // 如果查询字符串太短，限制返回数量
  const adjustedLimit = query.length <= 2 ? Math.min(safeLimit, 10) : safeLimit;

  return {
    version: '2018-05-29',
    operation: 'POST',
    path: '/city/_search',
    params: {
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        timeout: '5s',
        query: {
          bool: {
            should: [
              {
                term: {
                  'name.keyword': {
                    value: query,
                    boost: 10.0,
                  },
                },
              },
              {
                prefix: {
                  'name.keyword': {
                    value: query,
                    boost: 5.0,
                  },
                },
              },
              ...(query.length >= 3
                ? [
                    {
                      match: {
                        name: {
                          query: query,
                          fuzziness: 'AUTO',
                          boost: 2.0,
                          minimum_should_match: '75%',
                        },
                      },
                    },
                  ]
                : []),
            ],
            minimum_should_match: 1,
            filter: [
              {
                exists: {
                  field: 'name',
                },
              },
            ],
          },
        },
        size: adjustedLimit,
        sort: [
          '_score',
          {
            'name.keyword': {
              order: 'asc',
            },
          },
        ],
        _source: ['name', 'lat', 'lng', 'country', 'admin1', 'admin2'],
        min_score: 0.1,
      },
    },
  };
}
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const hits = ctx.result.hits.hits || [];

  const filteredResults = hits
    .filter(function(hit) {
      return (
        hit._source &&
        hit._source.name &&
        hit._source.lat !== null &&
        hit._source.lng !== null &&
        hit._source.country
      );
    })
    .map(function(hit) {
      return {
        name: hit._source.name,
        lat: hit._source.lat,
        lng: hit._source.lng,
        country: hit._source.country,
        admin1: hit._source.admin1 || '',
        admin2: hit._source.admin2 || '',
        score: hit._score,
      };
    });

  return filteredResults.slice(0, 10);
}
