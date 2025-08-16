// Core business entities for ECOMMIND platform

export interface Company {
  id: string
  name: string
  cnpj?: string
  email: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  companyId: string
  email: string
  fullName: string
  role: 'admin' | 'manager' | 'operator'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Channel {
  id: string
  name: string
  type: 'marketplace' | 'ecommerce' | 'physical'
  platform: 'mercado_livre' | 'shopee' | 'amazon' | 'site_proprio' | 'loja_fisica'
  isActive: boolean
  config: Record<string, any>
  fees: {
    commission: number // Percentual de comissão
    fixedFee: number // Taxa fixa por venda
    shippingFee?: number // Taxa de frete
  }
}

export interface Product {
  id: string
  companyId: string
  sku: string
  name: string
  description?: string
  category: string
  brand?: string
  costPrice: number // Preço de custo
  suggestedPrice: number // Preço sugerido
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductChannel {
  id: string
  productId: string
  channelId: string
  externalId: string // ID no marketplace
  price: number // Preço de venda no canal
  stock: number
  isActive: boolean
  lastSyncAt: Date
}

export interface Order {
  id: string
  companyId: string
  channelId: string
  externalId: string // ID no marketplace
  customerName: string
  customerEmail?: string
  customerPhone?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  totalValue: number
  shippingCost: number
  discountValue: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  costPrice: number // Para cálculo de margem
}

export interface StockMovement {
  id: string
  productId: string
  channelId?: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string // Pedido, fornecedor, etc.
  createdAt: Date
}

export interface Alert {
  id: string
  companyId: string
  type: 'stock_low' | 'margin_low' | 'order_pending' | 'payment_overdue' | 'custom'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data: Record<string, any> // Dados específicos do alerta
  isRead: boolean
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
}

export interface Task {
  id: string
  companyId: string
  assignedTo?: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  relatedEntity?: {
    type: 'product' | 'order' | 'alert'
    id: string
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  companyId: string
  type: 'sales' | 'margin' | 'orders' | 'custom'
  name: string
  targetValue: number
  currentValue: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  channelId?: string // Meta específica por canal
  productId?: string // Meta específica por produto
  isActive: boolean
}

// Calculated metrics interfaces
export interface SalesMetrics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalMargin: number
  marginPercentage: number
  period: {
    start: Date
    end: Date
  }
  comparison?: {
    previousPeriod: SalesMetrics
    changePercentage: number
  }
}

export interface ProductMetrics {
  productId: string
  sku: string
  name: string
  totalSales: number
  totalOrders: number
  currentStock: number
  stockCoverage: number // Dias de cobertura
  averageMargin: number
  marginPercentage: number
  channels: {
    channelId: string
    channelName: string
    sales: number
    orders: number
    stock: number
    price: number
  }[]
}

export interface ChannelMetrics {
  channelId: string
  channelName: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalMargin: number
  marginPercentage: number
  marketShare: number // Percentual das vendas totais
  topProducts: {
    productId: string
    sku: string
    name: string
    sales: number
    orders: number
  }[]
}

// WhatsApp integration types
export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  message: string
  type: 'text' | 'image' | 'document'
  timestamp: Date
  isInbound: boolean
  isProcessed: boolean
  response?: string
}

export interface WhatsAppQuery {
  id: string
  userId: string
  query: string
  intent: 'sales' | 'stock' | 'orders' | 'margin' | 'alerts' | 'tasks' | 'general'
  response: string
  executionTime: number
  createdAt: Date
}
