/**
 * 测试文件 - 验证城市搜索功能
 * 使用方法：在您的前端组件中导入并使用这些测试函数
 */

import { generateClient } from "aws-amplify/data";
import type { Schema } from "./resource";
import { useState } from 'react';

const client = generateClient<Schema>();

type TestResults = {
  functionality: any;
  performance: any;
  dataStructure: any;
  timestamp: string;
  error?: string;
};

/**
 * 测试搜索功能
 */
export async function testCitySearch() {
  console.log("🧪 开始测试城市搜索功能...");
  
  try {
    // 测试 1: 搜索常见城市名称
    console.log("测试 1: 搜索 'Beijing'");
    const beijingResults = await client.queries.searchCitiesByName({
      cityName: "Beijing"
    });
    console.log("搜索结果:", beijingResults.data?.length || 0, "条");
    
    // 测试 2: 精确匹配
    console.log("测试 2: 精确匹配 'Shanghai'");
    const shanghaiResults = await client.queries.getCitybyRangeKey({
      rangeKey: "Shanghai"
    });
    console.log("精确匹配结果:", shanghaiResults.data?.length || 0, "条");
    
    // 测试 3: 按国家搜索
    console.log("测试 3: 搜索中国城市");
    const chinaResults = await client.queries.getCitiesByCountry({
      country: "CN"
    });
    console.log("中国城市数量:", chinaResults.data?.length || 0, "条");
    
    // 测试 4: 部分匹配
    console.log("测试 4: 搜索包含 'New' 的城市");
    const newResults = await client.queries.searchCitiesByName({
      cityName: "New"
    });
    console.log("包含 'New' 的城市:", newResults.data?.length || 0, "条");
    
    console.log("✅ 所有测试完成!");
    
    return {
      beijing: beijingResults.data,
      shanghai: shanghaiResults.data,
      china: chinaResults.data,
      newCities: newResults.data
    };
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  }
}

/**
 * 测试搜索性能
 */
export async function testSearchPerformance() {
  console.log("⚡ 开始性能测试...");
  
  const testQueries = [
    "Beijing",
    "Shanghai", 
    "New York",
    "London",
    "Tokyo"
  ];
  
  const results = [];
  
  for (const query of testQueries) {
    const startTime = performance.now();
    
    try {
      const result = await client.queries.searchCitiesByName({
        cityName: query
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results.push({
        query,
        duration: Math.round(duration),
        resultCount: result.data?.length || 0
      });
      
      console.log(`${query}: ${duration.toFixed(2)}ms, ${result.data?.length || 0} 结果`);
      
    } catch (error) {
      console.error(`❌ ${query} 查询失败:`, error);
    }
  }
  
  const averageTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`📊 平均查询时间: ${averageTime.toFixed(2)}ms`);
  
  return results;
}

/**
 * 验证数据结构
 */
export async function validateDataStructure() {
  console.log("🔍 验证数据结构...");
  
  try {
    // 获取一个城市数据，验证字段结构
    const result = await client.queries.searchCitiesByName({
      cityName: "Beijing"
    });
    
    if (result.data && result.data.length > 0) {
      const city = result.data[0];
      console.log("示例城市数据:", city);
      
      // 验证必需字段
      const requiredFields = ['hashKey', 'rangeKey', 'country', 'latitude', 'longitude'];
      const missingFields = requiredFields.filter(field => city && !Object.prototype.hasOwnProperty.call(city, field));
      
      if (missingFields.length > 0) {
        console.warn("⚠️ 缺少字段:", missingFields);
      } else {
        console.log("✅ 数据结构验证通过!");
      }
      
      return {
        valid: missingFields.length === 0,
        missingFields,
        sampleData: city
      };
    } else {
      console.warn("⚠️ 没有找到测试数据");
      return { valid: false, error: "No test data found" };
    }
    
  } catch (error) {
    console.error("❌ 数据结构验证失败:", error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * 综合测试函数
 */
export async function runAllTests(): Promise<TestResults> {
  console.log("🚀 开始综合测试...");
  
  const testResults: TestResults = {
    functionality: null,
    performance: null,
    dataStructure: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 功能测试
    testResults.functionality = await testCitySearch();
    console.log("✅ 功能测试完成");
    
    // 性能测试
    testResults.performance = await testSearchPerformance();
    console.log("✅ 性能测试完成");
    
    // 数据结构验证
    testResults.dataStructure = await validateDataStructure();
    console.log("✅ 数据结构验证完成");
    
    console.log("🎉 所有测试完成!");
    return testResults;
    
  } catch (error) {
    console.error("❌ 测试过程中出现错误:", error);
    testResults.error = error instanceof Error ? error.message : "Unknown error";
    return testResults;
  }
}

/**
 * React Hook 用于测试
 */
export function useTestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };
  
  return {
    isRunning,
    results,
    error,
    runTests
  };
}
