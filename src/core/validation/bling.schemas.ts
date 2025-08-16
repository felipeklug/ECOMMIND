/**
 * Bling ERP Validation Schemas
 * Zod schemas for Bling API integration
 */

import { z } from 'zod';

// =====================================================
// OAUTH & AUTH SCHEMAS
// =====================================================

export const BlingOAuthConfigSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
  redirect_uri: z.string().url('Invalid redirect URI'),
  scopes: z.array(z.string()).default(['read', 'write']),
});

export const BlingTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number(),
  scope: z.string().optional(),
});

export const BlingRefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// =====================================================
// PRODUCT SCHEMAS
// =====================================================

export const BlingProductSchema = z.object({
  id: z.number(),
  codigo: z.string().optional(),
  descricao: z.string(),
  tipo: z.enum(['P', 'S']).default('P'), // P = Produto, S = Serviço
  situacao: z.enum(['Ativo', 'Inativo']).default('Ativo'),
  formato: z.enum(['S', 'E', 'V']).default('S'), // S = Simples, E = Com variações, V = Variação
  descricaoComplementar: z.string().optional(),
  unidade: z.string().default('UN'),
  vlr_unit: z.number().optional(),
  preco_custo: z.number().optional(),
  peso_bruto: z.number().optional(),
  peso_liq: z.number().optional(),
  marca: z.string().optional(),
  class_fiscal: z.string().optional(),
  cest: z.string().optional(),
  origem: z.number().optional(),
  gtin: z.string().optional(),
  gtinEmbalagem: z.string().optional(),
  largura: z.number().optional(),
  altura: z.number().optional(),
  profundidade: z.number().optional(),
  dataInclusao: z.string().optional(),
  dataAlteracao: z.string().optional(),
  urlImagem: z.string().url().optional(),
  categoria: z.object({
    id: z.number(),
    descricao: z.string(),
  }).optional(),
  deposito: z.object({
    id: z.number(),
    descricao: z.string(),
    saldoVirtualTotal: z.number().optional(),
    saldoFisicoTotal: z.number().optional(),
  }).optional(),
});

export const BlingProductListResponseSchema = z.object({
  retorno: z.object({
    produtos: z.array(z.object({
      produto: BlingProductSchema,
    })),
    pagina: z.number(),
    numero_paginas: z.number(),
  }),
});

export const BlingProductSyncRequestSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  filters: z.object({
    situacao: z.enum(['Ativo', 'Inativo', 'Todos']).default('Ativo'),
    tipo: z.enum(['P', 'S', 'Todos']).default('P'),
    dataInclusao: z.string().optional(),
    dataAlteracao: z.string().optional(),
  }).optional(),
});

// =====================================================
// ORDER SCHEMAS
// =====================================================

export const BlingOrderItemSchema = z.object({
  codigo: z.string(),
  descricao: z.string(),
  qtde: z.number(),
  vlr_unit: z.number(),
  vlr_desconto: z.number().default(0),
  vlr_total: z.number(),
});

export const BlingOrderSchema = z.object({
  numero: z.string(),
  numeroOrdemCompra: z.string().optional(),
  data: z.string(), // YYYY-MM-DD
  dataSaida: z.string().optional(),
  dataPrevista: z.string().optional(),
  totalvenda: z.number(),
  totalprodutos: z.number(),
  totalvenda: z.number(),
  desconto: z.number().default(0),
  frete: z.number().default(0),
  situacao: z.enum([
    'Em aberto',
    'Em andamento', 
    'Venda agrupada',
    'Verificado',
    'Estorno',
    'Cancelado',
    'Em digitação',
    'Atendido'
  ]),
  cliente: z.object({
    id: z.number(),
    nome: z.string(),
    cnpj: z.string().optional(),
    ie: z.string().optional(),
    rg: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    cidade: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    uf: z.string().optional(),
    email: z.string().email().optional(),
    celular: z.string().optional(),
    fone: z.string().optional(),
  }),
  itens: z.array(z.object({
    item: BlingOrderItemSchema,
  })),
  parcelas: z.array(z.object({
    parcela: z.object({
      dias: z.number(),
      data: z.string(),
      vlr: z.number(),
      obs: z.string().optional(),
    }),
  })).optional(),
  transporte: z.object({
    transportadora: z.string().optional(),
    tipo_frete: z.enum(['R', 'D', 'T', 'S']).optional(), // R=Remetente, D=Destinatário, T=Terceiros, S=Sem frete
    servico_correios: z.string().optional(),
    dados_etiqueta: z.object({
      nome: z.string().optional(),
      endereco: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      municipio: z.string().optional(),
      uf: z.string().optional(),
      cep: z.string().optional(),
      bairro: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const BlingOrderListResponseSchema = z.object({
  retorno: z.object({
    pedidos: z.array(z.object({
      pedido: BlingOrderSchema,
    })),
    pagina: z.number(),
    numero_paginas: z.number(),
  }),
});

export const BlingOrderSyncRequestSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  filters: z.object({
    dataInicial: z.string().optional(), // YYYY-MM-DD
    dataFinal: z.string().optional(),   // YYYY-MM-DD
    situacao: z.string().optional(),
    idSituacao: z.number().optional(),
  }).optional(),
});

// =====================================================
// FINANCE SCHEMAS
// =====================================================

export const BlingFinanceAccountSchema = z.object({
  id: z.number(),
  descricao: z.string(),
  situacao: z.enum(['Ativo', 'Inativo']),
});

export const BlingFinanceAPSchema = z.object({
  id: z.number(),
  dataVencimento: z.string(), // YYYY-MM-DD
  valor: z.number(),
  saldo: z.number(),
  historico: z.string(),
  categoria: z.string().optional(),
  portador: z.string().optional(),
  fornecedor: z.object({
    id: z.number(),
    nome: z.string(),
    cnpj: z.string().optional(),
  }).optional(),
  situacao: z.enum(['Aberto', 'Quitado', 'Parcialmente quitado']),
  dataInclusao: z.string().optional(),
  dataAlteracao: z.string().optional(),
});

export const BlingFinanceARSchema = z.object({
  id: z.number(),
  dataVencimento: z.string(), // YYYY-MM-DD
  valor: z.number(),
  saldo: z.number(),
  historico: z.string(),
  categoria: z.string().optional(),
  portador: z.string().optional(),
  cliente: z.object({
    id: z.number(),
    nome: z.string(),
    cnpj: z.string().optional(),
  }).optional(),
  situacao: z.enum(['Aberto', 'Quitado', 'Parcialmente quitado']),
  dataInclusao: z.string().optional(),
  dataAlteracao: z.string().optional(),
});

export const BlingFinanceAPListResponseSchema = z.object({
  retorno: z.object({
    contaspagar: z.array(z.object({
      contapagar: BlingFinanceAPSchema,
    })),
    pagina: z.number(),
    numero_paginas: z.number(),
  }),
});

export const BlingFinanceARListResponseSchema = z.object({
  retorno: z.object({
    contasreceber: z.array(z.object({
      contareceber: BlingFinanceARSchema,
    })),
    pagina: z.number(),
    numero_paginas: z.number(),
  }),
});

export const BlingFinanceSyncRequestSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  filters: z.object({
    dataInicial: z.string().optional(), // YYYY-MM-DD
    dataFinal: z.string().optional(),   // YYYY-MM-DD
    situacao: z.enum(['Aberto', 'Quitado', 'Parcialmente quitado', 'Todos']).default('Todos'),
  }).optional(),
});

// =====================================================
// WEBHOOK SCHEMAS
// =====================================================

export const BlingWebhookEventSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    type: z.string(),
    date: z.string(),
  }),
  signature: z.string().optional(),
});

export const BlingWebhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'order.created',
    'order.updated', 
    'order.deleted',
    'product.created',
    'product.updated',
    'product.deleted',
    'stock.updated'
  ])),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters'),
});

// =====================================================
// SYNC & TRIGGER SCHEMAS
// =====================================================

export const BlingSyncTriggerSchema = z.object({
  resource: z.enum(['products', 'orders', 'finance', 'all']),
  force: z.boolean().default(false),
  filters: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
  }).optional(),
});

export const BlingSyncStatusSchema = z.object({
  resource: z.string(),
  status: z.enum(['idle', 'running', 'completed', 'error']),
  progress: z.object({
    current: z.number(),
    total: z.number(),
    percentage: z.number(),
  }).optional(),
  lastSync: z.string().optional(),
  nextSync: z.string().optional(),
  error: z.string().optional(),
});

// =====================================================
// API RESPONSE SCHEMAS
// =====================================================

export const BlingApiErrorSchema = z.object({
  erro: z.object({
    cod: z.number(),
    msg: z.string(),
  }),
});

export const BlingApiSuccessSchema = z.object({
  retorno: z.object({
    status: z.string(),
    codigo: z.number().optional(),
  }),
});

// =====================================================
// INTERNAL MAPPING SCHEMAS
// =====================================================

export const BlingProductMappingSchema = z.object({
  company_id: z.string().uuid(),
  bling_id: z.string(),
  internal_sku: z.string(),
  bling_sku: z.string().optional(),
  product_type: z.enum(['PA', 'MP', 'PI', 'SE']).default('PA'),
  sync_enabled: z.boolean().default(true),
});

export const BlingIntegrationConfigSchema = z.object({
  company_id: z.string().uuid(),
  sync_enabled: z.boolean().default(true),
  webhook_enabled: z.boolean().default(false),
  sync_intervals: z.object({
    products: z.number().min(60).default(3600), // seconds
    orders: z.number().min(60).default(900),    // seconds  
    finance: z.number().min(60).default(1800),  // seconds
  }).default({}),
  filters: z.object({
    product_types: z.array(z.string()).default(['PA']),
    order_statuses: z.array(z.string()).default([]),
    date_range_days: z.number().min(1).max(365).default(90),
  }).default({}),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type BlingOAuthConfig = z.infer<typeof BlingOAuthConfigSchema>;
export type BlingTokenResponse = z.infer<typeof BlingTokenResponseSchema>;
export type BlingProduct = z.infer<typeof BlingProductSchema>;
export type BlingOrder = z.infer<typeof BlingOrderSchema>;
export type BlingFinanceAP = z.infer<typeof BlingFinanceAPSchema>;
export type BlingFinanceAR = z.infer<typeof BlingFinanceARSchema>;
export type BlingWebhookEvent = z.infer<typeof BlingWebhookEventSchema>;
export type BlingSyncTrigger = z.infer<typeof BlingSyncTriggerSchema>;
export type BlingSyncStatus = z.infer<typeof BlingSyncStatusSchema>;
export type BlingProductMapping = z.infer<typeof BlingProductMappingSchema>;
export type BlingIntegrationConfig = z.infer<typeof BlingIntegrationConfigSchema>;
