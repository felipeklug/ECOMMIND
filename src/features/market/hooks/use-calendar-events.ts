/**
 * Calendar Events Hook
 * Fetches calendar events with filters
 */

'use client';

import useSWR from 'swr';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  channel: string | null;
  category: string | null;
  importance: 'low' | 'medium' | 'high';
  source: 'seed' | 'manual' | 'upload';
  metadata: Record<string, any>;
  created_at: string;
}

interface CalendarEventsData {
  events: CalendarEvent[];
  eventsByDate: Record<string, CalendarEvent[]>;
  total: number;
  filters: {
    from?: string;
    to?: string;
    channel?: string;
    category?: string;
    importance?: string;
  };
}

interface UseCalendarEventsParams {
  from?: string;
  to?: string;
  channel?: string;
  category?: string;
  importance?: string;
  niche?: string;
  global?: boolean;
  include_silenced?: boolean;
}

const fetcher = async (url: string): Promise<CalendarEventsData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }
  return response.json();
};

export function useCalendarEvents(params: UseCalendarEventsParams = {}) {
  // Build query string
  const searchParams = new URLSearchParams();
  
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.channel && params.channel !== 'all') searchParams.set('channel', params.channel);
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.importance && params.importance !== 'all') searchParams.set('importance', params.importance);
  if (params.niche && params.niche !== 'all') searchParams.set('niche', params.niche);
  if (params.global !== undefined) searchParams.set('global', params.global.toString());
  if (params.include_silenced !== undefined) searchParams.set('include_silenced', params.include_silenced.toString());

  const queryString = searchParams.toString();
  const url = `/api/planning/calendar/list${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<CalendarEventsData>(
    url,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
      fallbackData: undefined,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook for creating calendar events
 */
export function useCreateCalendarEvent() {
  const createEvent = async (eventData: {
    date: string;
    title: string;
    channel?: string;
    category?: string;
    importance?: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
  }) => {
    const response = await fetch('/api/planning/calendar/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    return response.json();
  };

  return { createEvent };
}

/**
 * Hook for uploading calendar events
 */
export function useUploadCalendarEvents() {
  const uploadEvents = async (data: {
    events: any[];
    file_name?: string;
  }) => {
    const response = await fetch('/api/planning/calendar/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload events');
    }

    return response.json();
  };

  return { uploadEvents };
}
