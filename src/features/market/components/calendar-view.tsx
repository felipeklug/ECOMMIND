/**
 * Calendar View Component
 * Monthly calendar grid with events
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  channel: string | null;
  category: string | null;
  importance: 'low' | 'medium' | 'high';
  source: 'seed' | 'manual' | 'upload';
  metadata: Record<string, any>;
}

interface CalendarViewProps {
  currentDate: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  onEventClick: (event: CalendarEvent) => void;
  isLoading?: boolean;
  error?: any;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getImportanceColor(importance: string) {
  switch (importance) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
  }
}

function getChannelIcon(channel: string | null) {
  switch (channel) {
    case 'meli':
      return '🛒';
    case 'shopee':
      return '🛍️';
    case 'amazon':
      return '📦';
    case 'site':
      return '🌐';
    default:
      return '📅';
  }
}

export function CalendarView({ 
  currentDate, 
  eventsByDate, 
  onEventClick, 
  isLoading, 
  error 
}: CalendarViewProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Erro ao carregar calendário</p>
          <p className="text-xs mt-1">Tente novamente em alguns instantes</p>
        </div>
      </div>
    );
  }

  // Calculate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <div className="space-y-4">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={dayKey}
              className={cn(
                'min-h-[120px] p-2 border rounded-lg transition-colors',
                isCurrentMonth 
                  ? 'bg-background border-border' 
                  : 'bg-muted/30 border-muted',
                isDayToday && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                    isDayToday && 'text-primary font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5 px-1">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <Button
                    key={event.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onEventClick(event)}
                    className={cn(
                      'w-full h-auto p-1 text-xs justify-start font-normal',
                      getImportanceColor(event.importance)
                    )}
                  >
                    <span className="mr-1">
                      {getChannelIcon(event.channel)}
                    </span>
                    <span className="truncate">
                      {event.title}
                    </span>
                  </Button>
                ))}
                
                {/* Show more indicator */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Carregando eventos...</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div>
          <span className="text-xs text-muted-foreground">Alta Prioridade</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
          <span className="text-xs text-muted-foreground">Média Prioridade</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
          <span className="text-xs text-muted-foreground">Baixa Prioridade</span>
        </div>
      </div>
    </div>
  );
}
