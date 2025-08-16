// ECOMMIND Core Types

export interface User {
  id: string
  email: string
  name: string
  company: string
  role: 'owner' | 'manager' | 'analyst'
  whatsappNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  name: string
  cnpj?: string
  blingApiKey?: string
  whatsappBusinessId?: string
  settings: CompanySettings
  createdAt: Date
  updatedAt: Date
}

export interface CompanySettings {
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  alertPreferences: {
    stockRupture: boolean
    lowMargin: boolean
    negativeBalance: boolean
    frequency: 'immediate' | 'hourly' | 'daily'
  }
  top20Products: string[]
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  cost: number
  price: number
  stock: number
  minStock: number
  channels: ProductChannel[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductChannel {
  channel: 'mercadolivre' | 'shopee' | 'amazon' | 'website'
  productId: string
  price: number
  stock: number
  isActive: boolean
  fees: ChannelFees
}

export interface ChannelFees {
  commission: number
  shipping: number
  payment: number
  other: number
}

export interface Order {
  id: string
  externalId: string
  channel: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer: Customer
  items: OrderItem[]
  total: number
  fees: number
  netMargin: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  cost: number
  margin: number
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
  address?: Address
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface Alert {
  id: string
  type: 'stock_rupture' | 'low_margin' | 'negative_balance' | 'goal_deviation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data: Record<string, unknown>
  isRead: boolean
  isResolved: boolean
  createdAt: Date
  resolvedAt?: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  relatedProduct?: string
  relatedChannel?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  type: 'text' | 'image' | 'document'
  content: string
  timestamp: Date
  isIncoming: boolean
  isProcessed: boolean
}

export interface FinancialRecord {
  id: string
  type: 'receivable' | 'payable'
  description: string
  amount: number
  dueDate: Date
  paidDate?: Date
  status: 'pending' | 'paid' | 'overdue'
  category: string
  relatedOrder?: string
}

export interface CashFlowProjection {
  date: Date
  inflow: number
  outflow: number
  balance: number
  details: {
    receivables: FinancialRecord[]
    payables: FinancialRecord[]
  }
}