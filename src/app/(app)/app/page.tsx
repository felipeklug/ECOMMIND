/**
 * App Dashboard - Página principal do aplicativo
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - ECOMMIND',
  description: 'Visão geral do seu negócio',
};

export default function AppDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio e principais métricas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Vendas Hoje</h3>
          </div>
          <div className="text-2xl font-bold">R$ 12.450</div>
          <p className="text-xs text-muted-foreground">
            +15% em relação a ontem
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Pedidos</h3>
          </div>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">
            +7% em relação a ontem
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ticket Médio</h3>
          </div>
          <div className="text-2xl font-bold">R$ 140</div>
          <p className="text-xs text-muted-foreground">
            +2% em relação a ontem
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Margem</h3>
          </div>
          <div className="text-2xl font-bold">28%</div>
          <p className="text-xs text-muted-foreground">
            +1% em relação a ontem
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Vendas por Canal</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mercado Livre</span>
              <span className="text-sm font-medium">R$ 7.200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Shopee</span>
              <span className="text-sm font-medium">R$ 3.100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Site Próprio</span>
              <span className="text-sm font-medium">R$ 2.150</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Alertas Recentes</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Estoque baixo</p>
                <p className="text-xs text-muted-foreground">
                  Produto X com apenas 3 unidades
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Margem baixa</p>
                <p className="text-xs text-muted-foreground">
                  Produto Y com margem de 12%
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Nova oportunidade</p>
                <p className="text-xs text-muted-foreground">
                  Produto Z em alta no mercado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
