// Mock data service for ECOMMIND platform development

import type {
  Company,
  User,
  Channel,
  Product,
  ProductChannel,
  Order,
  OrderItem,
  Alert,
  Task,
  Goal
} from '@/types/business'

// Mock company data
export const mockCompany: Company = {
  id: 'comp_1',
  name: 'TechStore Brasil',
  cnpj: '12.345.678/0001-90',
  email: 'contato@techstore.com.br',
  phone: '(11) 99999-9999',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-12-15')
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user_1',
    companyId: 'comp_1',
    email: 'admin@techstore.com.br',
    fullName: 'João Silva',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: 'user_2',
    companyId: 'comp_1',
    email: 'maria@techstore.com.br',
    fullName: 'Maria Santos',
    role: 'manager',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-10')
  }
]

// Mock channels
export const mockChannels: Channel[] = [
  {
    id: 'ch_ml',
    name: 'Mercado Livre',
    type: 'marketplace',
    platform: 'mercado_livre',
    isActive: true,
    config: { storeId: 'TECHSTORE123' },
    fees: {
      commission: 11.5, // 11.5% de comissão
      fixedFee: 2.50,   // R$ 2,50 por venda
      shippingFee: 0    // Frete por conta do comprador
    }
  },
  {
    id: 'ch_shopee',
    name: 'Shopee',
    type: 'marketplace',
    platform: 'shopee',
    isActive: true,
    config: { shopId: 'techstore_br' },
    fees: {
      commission: 8.5,  // 8.5% de comissão
      fixedFee: 1.00,   // R$ 1,00 por venda
      shippingFee: 0
    }
  },
  {
    id: 'ch_site',
    name: 'Site Próprio',
    type: 'ecommerce',
    platform: 'site_proprio',
    isActive: true,
    config: { domain: 'techstore.com.br' },
    fees: {
      commission: 3.5,  // 3.5% gateway de pagamento
      fixedFee: 0.50,   // R$ 0,50 por transação
      shippingFee: 0
    }
  }
]

// Mock products
export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    companyId: 'comp_1',
    sku: 'SMARTPHONE-XYZ-128',
    name: 'Smartphone XYZ 128GB',
    description: 'Smartphone com 128GB de armazenamento, câmera tripla e tela AMOLED',
    category: 'Smartphones',
    brand: 'TechBrand',
    costPrice: 450.00,
    suggestedPrice: 699.90,
    weight: 0.18,
    dimensions: { length: 15, width: 7, height: 0.8 },
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: 'prod_2',
    companyId: 'comp_1',
    sku: 'FONE-BT-ABC',
    name: 'Fone Bluetooth ABC',
    description: 'Fone de ouvido Bluetooth com cancelamento de ruído',
    category: 'Áudio',
    brand: 'AudioTech',
    costPrice: 65.00,
    suggestedPrice: 129.90,
    weight: 0.25,
    dimensions: { length: 20, width: 18, height: 8 },
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-05')
  },
  {
    id: 'prod_3',
    companyId: 'comp_1',
    sku: 'CARREGADOR-USB-C',
    name: 'Carregador USB-C 65W',
    description: 'Carregador rápido USB-C 65W compatível com notebooks e smartphones',
    category: 'Acessórios',
    brand: 'PowerTech',
    costPrice: 25.00,
    suggestedPrice: 59.90,
    weight: 0.15,
    dimensions: { length: 10, width: 5, height: 3 },
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-12-01')
  }
]

// Mock product channels (estoque por canal)
export const mockProductChannels: ProductChannel[] = [
  // Smartphone XYZ nos 3 canais
  {
    id: 'pc_1',
    productId: 'prod_1',
    channelId: 'ch_ml',
    externalId: 'MLB123456789',
    price: 749.90,
    stock: 5, // Estoque baixo!
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: 'pc_2',
    productId: 'prod_1',
    channelId: 'ch_shopee',
    externalId: 'SP987654321',
    price: 729.90,
    stock: 8,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: 'pc_3',
    productId: 'prod_1',
    channelId: 'ch_site',
    externalId: 'SITE_SMARTPHONE_XYZ',
    price: 699.90,
    stock: 12,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  
  // Fone Bluetooth nos 3 canais
  {
    id: 'pc_4',
    productId: 'prod_2',
    channelId: 'ch_ml',
    externalId: 'MLB111222333',
    price: 149.90,
    stock: 25,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: 'pc_5',
    productId: 'prod_2',
    channelId: 'ch_shopee',
    externalId: 'SP444555666',
    price: 139.90,
    stock: 18,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: 'pc_6',
    productId: 'prod_2',
    channelId: 'ch_site',
    externalId: 'SITE_FONE_BT',
    price: 129.90,
    stock: 30,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },

  // Carregador apenas no ML e Site
  {
    id: 'pc_7',
    productId: 'prod_3',
    channelId: 'ch_ml',
    externalId: 'MLB777888999',
    price: 69.90,
    stock: 50,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: 'pc_8',
    productId: 'prod_3',
    channelId: 'ch_site',
    externalId: 'SITE_CARREGADOR',
    price: 59.90,
    stock: 75,
    isActive: true,
    lastSyncAt: new Date('2024-12-15T10:30:00')
  }
]

// Mock orders (últimos 30 dias)
export const mockOrders: Order[] = [
  // Pedidos de hoje
  {
    id: 'ord_1',
    companyId: 'comp_1',
    channelId: 'ch_ml',
    externalId: 'ML_ORD_001',
    customerName: 'Carlos Silva',
    customerEmail: 'carlos@email.com',
    customerPhone: '(11) 98888-7777',
    status: 'confirmed',
    totalValue: 749.90,
    shippingCost: 15.00,
    discountValue: 0,
    items: [
      {
        id: 'item_1',
        orderId: 'ord_1',
        productId: 'prod_1',
        sku: 'SMARTPHONE-XYZ-128',
        productName: 'Smartphone XYZ 128GB',
        quantity: 1,
        unitPrice: 749.90,
        totalPrice: 749.90,
        costPrice: 450.00
      }
    ],
    createdAt: new Date('2024-12-15T14:30:00'),
    updatedAt: new Date('2024-12-15T14:30:00')
  },
  {
    id: 'ord_2',
    companyId: 'comp_1',
    channelId: 'ch_shopee',
    externalId: 'SP_ORD_002',
    customerName: 'Ana Costa',
    customerEmail: 'ana@email.com',
    status: 'pending',
    totalValue: 269.80,
    shippingCost: 12.00,
    discountValue: 20.00,
    items: [
      {
        id: 'item_2',
        orderId: 'ord_2',
        productId: 'prod_2',
        sku: 'FONE-BT-ABC',
        productName: 'Fone Bluetooth ABC',
        quantity: 2,
        unitPrice: 139.90,
        totalPrice: 279.80,
        costPrice: 65.00
      }
    ],
    createdAt: new Date('2024-12-15T16:45:00'),
    updatedAt: new Date('2024-12-15T16:45:00')
  },
  {
    id: 'ord_3',
    companyId: 'comp_1',
    channelId: 'ch_site',
    externalId: 'SITE_ORD_003',
    customerName: 'Pedro Santos',
    customerEmail: 'pedro@email.com',
    status: 'shipped',
    totalValue: 759.80,
    shippingCost: 0, // Frete grátis
    discountValue: 50.00,
    items: [
      {
        id: 'item_3',
        orderId: 'ord_3',
        productId: 'prod_1',
        sku: 'SMARTPHONE-XYZ-128',
        productName: 'Smartphone XYZ 128GB',
        quantity: 1,
        unitPrice: 699.90,
        totalPrice: 699.90,
        costPrice: 450.00
      },
      {
        id: 'item_4',
        orderId: 'ord_3',
        productId: 'prod_3',
        sku: 'CARREGADOR-USB-C',
        productName: 'Carregador USB-C 65W',
        quantity: 1,
        unitPrice: 59.90,
        totalPrice: 59.90,
        costPrice: 25.00
      }
    ],
    createdAt: new Date('2024-12-15T09:15:00'),
    updatedAt: new Date('2024-12-15T11:20:00')
  }
]

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    companyId: 'comp_1',
    type: 'stock_low',
    priority: 'high',
    title: 'Estoque Baixo - Smartphone XYZ',
    message: 'Produto com estoque para apenas 3 dias no Mercado Livre (5 unidades)',
    data: {
      productId: 'prod_1',
      channelId: 'ch_ml',
      currentStock: 5,
      dailySales: 1.7,
      daysLeft: 3
    },
    isRead: false,
    isResolved: false,
    createdAt: new Date('2024-12-15T08:00:00')
  },
  {
    id: 'alert_2',
    companyId: 'comp_1',
    type: 'margin_low',
    priority: 'medium',
    title: 'Margem Baixa - Fone Bluetooth',
    message: 'Margem do produto abaixo da meta no Shopee (12% vs 25% esperado)',
    data: {
      productId: 'prod_2',
      channelId: 'ch_shopee',
      currentMargin: 12,
      targetMargin: 25,
      price: 139.90,
      suggestedPrice: 169.90
    },
    isRead: false,
    isResolved: false,
    createdAt: new Date('2024-12-15T06:30:00')
  },
  {
    id: 'alert_3',
    companyId: 'comp_1',
    type: 'order_pending',
    priority: 'low',
    title: 'Pedido Pendente',
    message: 'Pedido #SP_ORD_002 aguardando confirmação há 4 horas',
    data: {
      orderId: 'ord_2',
      customerName: 'Ana Costa',
      value: 269.80,
      hoursWaiting: 4
    },
    isRead: true,
    isResolved: false,
    createdAt: new Date('2024-12-15T12:45:00')
  }
]

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task_1',
    companyId: 'comp_1',
    assignedTo: 'user_2',
    title: 'Repor estoque Smartphone XYZ',
    description: 'Contatar fornecedor para reposição urgente - estoque crítico no ML',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-12-16'),
    relatedEntity: {
      type: 'product',
      id: 'prod_1'
    },
    tags: ['estoque', 'urgente', 'fornecedor'],
    createdAt: new Date('2024-12-15T08:05:00'),
    updatedAt: new Date('2024-12-15T08:05:00')
  },
  {
    id: 'task_2',
    companyId: 'comp_1',
    assignedTo: 'user_1',
    title: 'Revisar preço Fone Bluetooth Shopee',
    description: 'Ajustar preço para melhorar margem - sugestão: R$ 169,90',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date('2024-12-17'),
    relatedEntity: {
      type: 'product',
      id: 'prod_2'
    },
    tags: ['preço', 'margem', 'shopee'],
    createdAt: new Date('2024-12-15T06:35:00'),
    updatedAt: new Date('2024-12-15T10:00:00')
  }
]

// Mock goals
export const mockGoals: Goal[] = [
  {
    id: 'goal_1',
    companyId: 'comp_1',
    type: 'sales',
    name: 'Meta Vendas Dezembro',
    targetValue: 50000,
    currentValue: 32450,
    period: 'monthly',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: 'goal_2',
    companyId: 'comp_1',
    type: 'margin',
    name: 'Meta Margem Geral',
    targetValue: 25,
    currentValue: 23.5,
    period: 'monthly',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    isActive: true
  }
]

// Helper function to generate more historical orders for calculations
export function generateHistoricalOrders(days: number = 30): Order[] {
  const orders: Order[] = [...mockOrders]
  const baseDate = new Date()
  
  for (let i = 1; i <= days; i++) {
    const orderDate = new Date(baseDate)
    orderDate.setDate(orderDate.getDate() - i)
    
    // Gerar 1-3 pedidos por dia
    const ordersPerDay = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < ordersPerDay; j++) {
      const randomChannel = mockChannels[Math.floor(Math.random() * mockChannels.length)]
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const productChannel = mockProductChannels.find(
        pc => pc.productId === randomProduct.id && pc.channelId === randomChannel.id
      )
      
      if (!productChannel) continue
      
      const quantity = Math.floor(Math.random() * 3) + 1
      const orderValue = productChannel.price * quantity
      
      orders.push({
        id: `hist_ord_${i}_${j}`,
        companyId: 'comp_1',
        channelId: randomChannel.id,
        externalId: `HIST_${randomChannel.platform.toUpperCase()}_${i}_${j}`,
        customerName: `Cliente ${i}-${j}`,
        customerEmail: `cliente${i}${j}@email.com`,
        status: Math.random() > 0.1 ? 'delivered' : 'cancelled',
        totalValue: orderValue,
        shippingCost: Math.random() * 20,
        discountValue: Math.random() > 0.8 ? Math.random() * 50 : 0,
        items: [
          {
            id: `hist_item_${i}_${j}`,
            orderId: `hist_ord_${i}_${j}`,
            productId: randomProduct.id,
            sku: randomProduct.sku,
            productName: randomProduct.name,
            quantity,
            unitPrice: productChannel.price,
            totalPrice: orderValue,
            costPrice: randomProduct.costPrice
          }
        ],
        createdAt: orderDate,
        updatedAt: orderDate
      })
    }
  }
  
  return orders
}
