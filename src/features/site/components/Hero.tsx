/**
 * Hero Section - Seção principal da home
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

const stats = [
  { label: 'Empresas ativas', value: '500+' },
  { label: 'Integrações', value: '15+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Satisfação', value: '4.8/5' },
];

const features = [
  {
    icon: BarChart3,
    title: 'BI Inteligente',
    description: 'Dashboards em tempo real com insights acionáveis',
  },
  {
    icon: MessageSquare,
    title: 'Chat 360',
    description: 'Atendimento unificado de todos os canais',
  },
  {
    icon: Zap,
    title: 'Automações',
    description: 'Missões IA que executam tarefas automaticamente',
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 pt-16 pb-20 sm:pt-24 sm:pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6"
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  🚀 Nova versão 2.0 disponível
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Inteligência para{' '}
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  E-commerce
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6 text-lg text-muted-foreground sm:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0"
              >
                Transforme seus dados em insights acionáveis. BI inteligente, Chat 360, automações e muito mais.{' '}
                <strong className="text-foreground">Modular, seguro e LGPD compliant.</strong>
              </motion.p>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
              >
                {features.map((feature, index) => (
                  <div key={feature.title} className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Button asChild size="lg" className="group">
                  <Link href="/login">
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/precos">Ver Planos</Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Dashboard Preview */}
                <div className="relative rounded-2xl bg-background/80 backdrop-blur-sm border shadow-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/20 p-6">
                    {/* Mock Dashboard Content */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-32 rounded bg-primary/20" />
                        <div className="h-6 w-20 rounded bg-muted" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 rounded-lg bg-primary/10 p-3">
                          <div className="h-3 w-16 rounded bg-primary/30 mb-2" />
                          <div className="h-4 w-12 rounded bg-primary/50" />
                        </div>
                        <div className="h-16 rounded-lg bg-green-500/10 p-3">
                          <div className="h-3 w-16 rounded bg-green-500/30 mb-2" />
                          <div className="h-4 w-12 rounded bg-green-500/50" />
                        </div>
                        <div className="h-16 rounded-lg bg-blue-500/10 p-3">
                          <div className="h-3 w-16 rounded bg-blue-500/30 mb-2" />
                          <div className="h-4 w-12 rounded bg-blue-500/50" />
                        </div>
                      </div>
                      <div className="h-32 rounded-lg bg-muted/50 p-4">
                        <div className="h-4 w-24 rounded bg-muted mb-3" />
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded bg-primary/20" />
                          <div className="h-2 w-3/4 rounded bg-primary/30" />
                          <div className="h-2 w-1/2 rounded bg-primary/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-primary/20 backdrop-blur-sm border"
                />
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-green-500/20 backdrop-blur-sm border"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
