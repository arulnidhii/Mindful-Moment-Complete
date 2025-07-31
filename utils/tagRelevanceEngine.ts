import { MoodEntry } from '@/types/mood';

export interface TagRelevance {
  id: string;
  count: number;
  recentCount: number; // Count in last 30 days
  relevanceScore: number; // 0-1 score based on frequency and recency
  category: string;
  lastUsed: Date;
}

export interface TagCategory {
  name: string;
  icon: string;
  color: string;
  tags: TagRelevance[];
  totalCount: number;
  recentCount: number;
}

// Tag categorization system
const TAG_CATEGORIES = {
  wellness: {
    name: 'Wellness',
    icon: 'spa',
    tags: ['nature', 'meditation', 'exercise', 'healthy_food', 'good_sleep', 'digital_detox', 'breaks'],
    color: '#AEE6C5'
  },
  social: {
    name: 'Social',
    icon: 'people',
    tags: ['family', 'friends', 'social_media', 'conversation', 'conflict'],
    color: '#B3D8F6'
  },
  work: {
    name: 'Work',
    icon: 'work',
    tags: ['deadlines', 'meetings', 'focus', 'stress', 'achievement'],
    color: '#D6C6F6'
  },
  technology: {
    name: 'Technology',
    icon: 'computer',
    tags: ['screen_time', 'social_media', 'digital_detox', 'notifications'],
    color: '#FFE5B3'
  },
  health: {
    name: 'Health',
    icon: 'favorite',
    tags: ['exercise', 'healthy_food', 'good_sleep', 'stress', 'overthinking'],
    color: '#F6B3B3'
  }
};

/**
 * Calculate tag relevance scores based on frequency and recency
 * This prevents tag pollution by prioritizing meaningful tags
 */
export function calculateTagRelevance(entries: MoodEntry[]): TagRelevance[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const tagStats: Record<string, {
    count: number;
    recentCount: number;
    lastUsed: Date;
  }> = {};

  // Collect all tags from entries
  entries.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    const isRecent = entryDate >= thirtyDaysAgo;
    
    // Process boosters
    entry.boosters?.forEach(tagId => {
      if (!tagStats[tagId]) {
        tagStats[tagId] = { count: 0, recentCount: 0, lastUsed: entryDate };
      }
      tagStats[tagId].count += 1;
      if (isRecent) tagStats[tagId].recentCount += 1;
      if (entryDate > tagStats[tagId].lastUsed) {
        tagStats[tagId].lastUsed = entryDate;
      }
    });

    // Process drainers
    entry.drainers?.forEach(tagId => {
      if (!tagStats[tagId]) {
        tagStats[tagId] = { count: 0, recentCount: 0, lastUsed: entryDate };
      }
      tagStats[tagId].count += 1;
      if (isRecent) tagStats[tagId].recentCount += 1;
      if (entryDate > tagStats[tagId].lastUsed) {
        tagStats[tagId].lastUsed = entryDate;
      }
    });
  });

  // Calculate relevance scores
  const maxCount = Math.max(...Object.values(tagStats).map(stat => stat.count), 1);
  const maxRecentCount = Math.max(...Object.values(tagStats).map(stat => stat.recentCount), 1);
  
  return Object.entries(tagStats).map(([tagId, stats]) => {
    // Relevance formula: 60% recent frequency + 30% total frequency + 10% recency
    const frequencyScore = stats.count / maxCount;
    const recentFrequencyScore = stats.recentCount / maxRecentCount;
    const recencyScore = Math.max(0, 1 - (now.getTime() - stats.lastUsed.getTime()) / (30 * 24 * 60 * 60 * 1000));
    
    const relevanceScore = (
      recentFrequencyScore * 0.6 +
      frequencyScore * 0.3 +
      recencyScore * 0.1
    );

    return {
      id: tagId,
      count: stats.count,
      recentCount: stats.recentCount,
      relevanceScore,
      category: getTagCategory(tagId),
      lastUsed: stats.lastUsed
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get the category for a tag
 */
function getTagCategory(tagId: string): string {
  for (const [categoryKey, category] of Object.entries(TAG_CATEGORIES)) {
    if (category.tags.includes(tagId)) {
      return categoryKey;
    }
  }
  return 'other';
}

/**
 * Group tags by category with relevance filtering
 */
export function groupTagsByCategory(tagRelevances: TagRelevance[]): TagCategory[] {
  const categories: Record<string, TagCategory> = {};
  
  // Initialize categories
  Object.entries(TAG_CATEGORIES).forEach(([key, category]) => {
    categories[key] = {
      name: category.name,
      icon: category.icon,
      color: category.color,
      tags: [],
      totalCount: 0,
      recentCount: 0
    };
  });

  // Add "other" category for uncategorized tags
  categories.other = {
    name: 'Other',
    icon: 'more-horiz',
    color: '#E0E0E0',
    tags: [],
    totalCount: 0,
    recentCount: 0
  };

  // Group tags by category
  tagRelevances.forEach(tag => {
    const category = categories[tag.category] || categories.other;
    category.tags.push(tag);
    category.totalCount += tag.count;
    category.recentCount += tag.recentCount;
  });

  // Filter out categories with no tags and sort by relevance
  return Object.values(categories)
    .filter(category => category.tags.length > 0)
    .map(category => ({
      ...category,
      tags: category.tags
        .filter(tag => tag.relevanceScore > 0.1) // Only show tags with meaningful relevance
        .slice(0, 6) // Limit to top 6 tags per category
    }))
    .sort((a, b) => b.recentCount - a.recentCount);
}

/**
 * Get top relevant tags for quick filtering
 */
export function getTopRelevantTags(tagRelevances: TagRelevance[], limit: number = 8): TagRelevance[] {
  return tagRelevances
    .filter(tag => tag.relevanceScore > 0.2) // Only meaningful tags
    .slice(0, limit);
}

/**
 * Get trending tags (tags that have increased in usage recently)
 */
export function getTrendingTags(tagRelevances: TagRelevance[]): TagRelevance[] {
  return tagRelevances
    .filter(tag => {
      // Trending: recent count is higher than expected based on total count
      const expectedRecentRatio = 0.3; // Expect 30% of usage to be recent
      const actualRecentRatio = tag.recentCount / Math.max(tag.count, 1);
      return actualRecentRatio > expectedRecentRatio * 1.5; // 50% higher than expected
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

/**
 * Get legacy tags (tags that were important but are fading)
 */
export function getLegacyTags(tagRelevances: TagRelevance[]): TagRelevance[] {
  return tagRelevances
    .filter(tag => {
      // Legacy: high total count but low recent usage
      const recentRatio = tag.recentCount / Math.max(tag.count, 1);
      return tag.count > 5 && recentRatio < 0.2; // Less than 20% recent usage
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
} 