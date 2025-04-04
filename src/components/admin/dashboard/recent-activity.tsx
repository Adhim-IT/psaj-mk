'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Activity {
  userName: string;
  userAvatar: string;
  action: string;
  time: string;
}

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  activities?: Activity[];
}

export function RecentActivity({ className, activities = [], ...props }: RecentActivityProps) {
  const [filter, setFilter] = useState<'today' | 'all'>('today');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  // Function to check if a time string represents an activity from today
  const isToday = (timeString: string) => {
    // Skip filtering for placeholder data
    if (timeString === '-' || timeString === 'Unknown') return false;

    // Parse the time string to determine if it's from today
    // Format is like "5s", "10m", "2h", "1d"
    const value = Number.parseInt(timeString);
    const unit = timeString.charAt(timeString.length - 1);

    if (isNaN(value)) return false;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const secondsSinceTodayStart = Math.floor((now.getTime() - todayStart.getTime()) / 1000);

    // Convert the time value to seconds
    let secondsAgo = 0;
    switch (unit) {
      case 's': // seconds
        secondsAgo = value;
        break;
      case 'm': // minutes
        secondsAgo = value * 60;
        break;
      case 'h': // hours
        secondsAgo = value * 3600;
        break;
      case 'd': // days
        secondsAgo = value * 86400;
        break;
      default:
        return false;
    }

    // If the activity happened before today started, it's not from today
    return secondsAgo < secondsSinceTodayStart;
  };

  // Update filtered activities when filter or activities change
  useEffect(() => {
    if (activities.length === 0) {
      setFilteredActivities([
        {
          userName: 'No recent activity',
          userAvatar: '/placeholder.svg',
          action: 'No actions recorded yet',
          time: '-',
        },
      ]);
      return;
    }

    if (filter === 'today') {
      const todayActivities = activities.filter((activity) => isToday(activity.time));

      // If no activities for today, show a message
      if (todayActivities.length === 0) {
        setFilteredActivities([
          {
            userName: 'No activity today',
            userAvatar: '/placeholder.svg',
            action: 'No actions recorded for today',
            time: '-',
          },
        ]);
      } else {
        setFilteredActivities(todayActivities);
      }
    } else {
      // Show all activities
      setFilteredActivities(activities);
    }
  }, [filter, activities]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as 'today' | 'all');
  };

  // Ensure the component takes the full height of its container
  const containerStyle: React.CSSProperties = {
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  };

  return (
    <Card className={cn('', className)} {...props}>
      <CardHeader className="pb-3 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">Aktivitas pengguna terbaru dalam sistem</CardDescription>
          </div>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={filter} onChange={handleFilterChange}>
            <option value="today">Hari Ini</option>
            <option value="all">Semua</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4" style={containerStyle}>
        <div className="space-y-5">
          {filteredActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-blue-100">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">{activity.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-gray-800">{activity.userName}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
