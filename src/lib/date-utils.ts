/**
 * Groups an array of objects by date based on a specified date property
 */
export function groupByDate<T>(
  items: T[],
  dateProperty: keyof T
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  items.forEach((item) => {
    const date = item[dateProperty] as unknown as Date;
    // Convert to local date string in YYYY-MM-DD format to handle timezone correctly
    const localDate = new Date(date);
    const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(item);
  });

  return grouped;
}

/**
 * Sorts date strings in descending order (most recent first)
 */
export function sortDatesDescending(dates: string[]): string[] {
  return [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

/**
 * Formats a date string into a human-readable heading with timezone awareness
 */
export function formatDateHeading(dateString: string): string {
  // Parse the date in local timezone
  const date = new Date(dateString);
  
  // Get the current date for comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Create a date object for comparison (without time)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format as Month Day, Year (e.g., "June 15, 2023")
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  // Add "Today" or "Yesterday" prefix for recent dates
  if (dateOnly.getTime() === today.getTime()) {
    return `Today (${formattedDate})`;
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return `Yesterday (${formattedDate})`;
  }
  
  return formattedDate;
}

/**
 * Formats a date to relative time (e.g., "2 hours ago", "5 days ago")
 * with timezone awareness
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
  
  if (diffInSeconds < 10) {
    return "Just now";
  }
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}