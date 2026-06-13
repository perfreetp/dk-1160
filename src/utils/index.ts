import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  COLUMNS: 'columns_data',
  PROPOSALS: 'proposals_data',
  QUESTIONS: 'questions_data',
  SCHEDULE: 'schedule_data',
  ARCHIVE: 'archive_data'
};

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await Taro.getStorage({ key });
      console.log(`[Storage] 读取成功: ${key}`, data.data);
      return data.data as T;
    } catch (error) {
      console.log(`[Storage] 读取失败，使用默认值: ${key}`, error);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Taro.setStorage({ key, data: value });
      console.log(`[Storage] 保存成功: ${key}`, value);
    } catch (error) {
      console.error(`[Storage] 保存失败: ${key}`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key });
      console.log(`[Storage] 删除成功: ${key}`);
    } catch (error) {
      console.error(`[Storage] 删除失败: ${key}`, error);
    }
  }
};

export const SENSITIVE_WORDS = [
  '敏感词1', '敏感词2', '敏感词3', '违禁词', '政治敏感', '色情', '暴力', '赌博', '诈骗'
];

export const checkDuplicateTitle = (title: string, existingTitles: string[]): boolean => {
  const normalizedTitle = title.toLowerCase().trim();
  for (const existing of existingTitles) {
    const normalizedExisting = existing.toLowerCase().trim();
    if (normalizedTitle === normalizedExisting) {
      return true;
    }
    const similarity = calculateSimilarity(normalizedTitle, normalizedExisting);
    if (similarity > 0.8) {
      return true;
    }
  }
  return false;
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

export const checkSensitiveWords = (content: string): { hasSensitive: boolean; words: string[] } => {
  const foundWords: string[] = [];
  const normalizedContent = content.toLowerCase();
  
  for (const word of SENSITIVE_WORDS) {
    if (normalizedContent.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }
  
  return {
    hasSensitive: foundWords.length > 0,
    words: foundWords
  };
};

export { STORAGE_KEYS };