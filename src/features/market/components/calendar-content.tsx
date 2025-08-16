/**
 * Calendar Content Component
 * Main calendar interface with events
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Plus,
  Upload,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Target,
  Brain,
  Sparkles,
  Settings,
} from 'lucide-react';
import { CalendarView } from './calendar-view';
import { EventDrawer } from './event-drawer';
import { CreateEventDialog } from './create-event-dialog';
import { UploadEventsDialog } from './upload-events-dialog';
import { useCalendarEvents } from '@/features/market/hooks/use-calendar-events';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filters, setFilters] = useState({
    channel: 'all',
    category: 'all',
    importance: 'all',
    niche: 'all',
    global: true,
    show_my_niche: true,
    show_my_events: true,
  });

  // Get calendar events for current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const { data: eventsData, isLoading, error, mutate } = useCalendarEvents({
    from: startOfMonth.toISOString().split('T')[0],
    to: endOfMonth.toISOString().split('T')[0],
    ...filters,
  });

  const events = eventsData?.events || [];
  const eventsByDate = eventsData?.eventsByDate || {};

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  const handleCreateMission = async (event: any) => {
    // TODO: Integrate with missions API
    console.log('Creating mission for event:', event);
  };

  const handleResolveNiche = async () => {
    try {
      const response = await fetch('/api/planning/calendar/resolve-niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_refresh: true }),
      });

      if (!response.ok) throw new Error('Failed to resolve niche');

      const result = await response.json();
      console.log('Niche resolved:', result);
      // TODO: Show success toast and update UI
    } catch (error) {
      console.error('Failed to resolve niche:', error);
      // TODO: Show error toast
    }
  };

  const handleCurateCalendar = async () => {
    try {
      const response = await fetch('/api/planning/calendar/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force_refresh: false,
          include_global: true,
          max_events_per_niche: 20,
          importance_threshold: 'low',
        }),
      });

      if (!response.ok) throw new Error('Failed to curate calendar');

      const result = await response.json();
      console.log('Calendar curated:', result);
      mutate(); // Refresh events
      // TODO: Show success toast with summary
    } catch (error) {
      console.error('Failed to curate calendar:', error);
      // TODO: Show error toast
    }
  };

  const getImportanceStats = () => {
    const stats = events.reduce((acc, event) => {
      acc[event.importance] = (acc[event.importance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
      total: events.length,
    };
  };

  const stats = getImportanceStats();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <h2 className="text-lg font-semibold">
                {formatDate(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="meli">Mercado Livre</SelectItem>
                <SelectItem value="shopee">Shopee</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="site">Site</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.niche} onValueChange={(value) => setFilters(prev => ({ ...prev, niche: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Nichos</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="pet">Pet</SelectItem>
                <SelectItem value="moda">Moda</SelectItem>
                <SelectItem value="beleza">Beleza</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                <SelectItem value="infantil">Infantil</SelectItem>
                <SelectItem value="esportes">Esportes</SelectItem>
                <SelectItem value="games">Games</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.importance} onValueChange={(value) => setFilters(prev => ({ ...prev, importance: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>

          <Button variant="outline" onClick={handleResolveNiche}>
            <Brain className="h-4 w-4 mr-2" />
            Resolver Nicho
          </Button>

          <Button variant="outline" onClick={handleCurateCalendar}>
            <Sparkles className="h-4 w-4 mr-2" />
            Curar IA
          </Button>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
              <Badge variant="destructive" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                !
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Prioridade</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                -
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixa Prioridade</p>
                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
              </div>
              <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                ·
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
          <CardDescription>
            Clique em um evento para ver detalhes e criar missões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarView
            currentDate={currentDate}
            eventsByDate={eventsByDate}
            onEventClick={handleEventClick}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Event Drawer */}
      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCreateMission={handleCreateMission}
          onRefresh={mutate}
        />
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          mutate();
        }}
      />

      {/* Upload Events Dialog */}
      <UploadEventsDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          setShowUploadDialog(false);
          mutate();
        }}
      />
    </div>
  );
}
