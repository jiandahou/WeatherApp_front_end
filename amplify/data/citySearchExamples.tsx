/**
 * 客户端使用示例 - 如何在前端使用城市搜索功能
 * 这个文件展示了如何在 React 组件中使用 Amplify 查询城市数据
 */

import { generateClient } from "aws-amplify/data";
import type { Schema } from "./resource";

// 生成数据客户端
const client = generateClient<Schema>();

/**
 * 根据城市名称搜索城市（模糊搜索）
 * @param {string} cityName - 城市名称
 * @returns {Promise<Array>} - 匹配的城市列表
 */
export async function searchCitiesByName(cityName: string) {
  try {
    const result = await client.queries.searchCitiesByName({
      cityName: cityName.trim()
    });
    
    return result.data || [];
  } catch (error) {
    console.error('搜索城市失败:', error);
    return [];
  }
}

/**
 * 根据 rangeKey 精确搜索城市
 * @param {string} rangeKey - 城市的 rangeKey
 * @returns {Promise<Array>} - 匹配的城市列表
 */
export async function getCityByRangeKey(rangeKey: string) {
  try {
    const result = await client.queries.getCitybyRangeKey({
      rangeKey: rangeKey.trim()
    });
    
    return result.data || [];
  } catch (error) {
    console.error('获取城市失败:', error);
    return [];
  }
}

/**
 * 根据国家代码获取城市列表
 * @param {string} country - 国家代码（如 'US', 'CN', 'JP'）
 * @returns {Promise<Array>} - 该国家的城市列表
 */
export async function getCitiesByCountry(country: string) {
  try {
    const result = await client.queries.getCitiesByCountry({
      country: country.toUpperCase()
    });
    
    return result.data || [];
  } catch (error) {
    console.error('获取国家城市失败:', error);
    return [];
  }
}

/**
 * React Hook 示例 - 城市搜索
 */
import { useState, useCallback } from 'react';

export function useCitySearch() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchCitiesByName(searchTerm);
      setCities(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cities,
    loading,
    error,
    searchCities
  };
}

/**
 * 使用示例代码 - 在您的组件中这样使用：
 * 
 * import { useCitySearch, searchCitiesByName } from './citySearchExamples';
 * 
 * function MyComponent() {
 *   const { cities, loading, error, searchCities } = useCitySearch();
 *   const [searchTerm, setSearchTerm] = useState('');
 * 
 *   const handleSearch = (e) => {
 *     const value = e.target.value;
 *     setSearchTerm(value);
 *     searchCities(value);
 *   };
 * 
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={searchTerm}
 *         onChange={handleSearch}
 *         placeholder="搜索城市..."
 *       />
 *       {loading && <div>搜索中...</div>}
 *       {error && <div>错误: {error}</div>}
 *       <div>
 *         {cities.map((city, index) => (
 *           <div key={index}>
 *             <h3>{city.rangeKey}</h3>
 *             <p>{city.country} - {city.admin1}</p>
 *             <p>坐标: {city.latitude}, {city.longitude}</p>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // 或者直接使用异步函数
 * async function handleCitySearch(cityName: string) {
 *   const cities = await searchCitiesByName(cityName);
 *   console.log('找到的城市:', cities);
 * }
 */
