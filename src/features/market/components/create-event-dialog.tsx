/**
 * Create Event Dialog Component
 * Form to create new calendar events
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus } from 'lucide-react';
import { useCreateCalendarEvent } from '@/features/market/hooks/use-calendar-events';
import { toast } from 'sonner';

const CreateEventSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  channel: z.string().optional(),
  category: z.string().optional(),
  importance: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof CreateEventSchema>;

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onClose, onSuccess }: CreateEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEvent } = useCreateCalendarEvent();

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      date: '',
      title: '',
      channel: '',
      category: '',
      importance: 'medium',
      description: '',
    },
  });

  const handleSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    
    try {
      const eventData = {
        date: data.date,
        title: data.title,
        channel: data.channel || null,
        category: data.category || null,
        importance: data.importance,
        metadata: {
          description: data.description || '',
          created_by_user: true,
        },
      };

      await createEvent(eventData);
      
      toast.success('Evento criado com sucesso!');
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao criar evento. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Evento
          </DialogTitle>
          <DialogDescription>
            Adicione um novo evento ao calendário de e-commerce
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Black Friday, Dia das Mães..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Channel */}
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um canal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Global (todos os canais)</SelectItem>
                      <SelectItem value="meli">Mercado Livre</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="site">Site Próprio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Deixe vazio para evento global
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Moda, Eletrônicos, Presentes..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Categoria de foco para o evento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Importance */}
            <FormField
              control={form.control}
              name="importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importância</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição adicional sobre o evento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Informações adicionais sobre o evento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Criando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
