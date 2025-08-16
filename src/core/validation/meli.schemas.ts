/**
 * Mercado Livre Validation Schemas
 * Zod schemas for Meli API integration
 */

import { z } from 'zod';

// =====================================================
// OAUTH & AUTH SCHEMAS
// =====================================================

export const MeliOAuthConfigSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
  redirect_uri: z.string().url('Invalid redirect URI'),
  scopes: z.array(z.string()).default(['read', 'write']),
});

export const MeliTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number(),
  scope: z.string(),
  user_id: z.number(),
});

export const MeliRefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// =====================================================
// USER & SITE SCHEMAS
// =====================================================

export const MeliUserSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  registration_date: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country_id: z.string(),
  email: z.string().email().optional(),
  identification: z.object({
    type: z.string(),
    number: z.string(),
  }).optional(),
  address: z.object({
    state: z.string(),
    city: z.string(),
  }).optional(),
  phone: z.object({
    area_code: z.string(),
    number: z.string(),
  }).optional(),
  alternative_phone: z.object({
    area_code: z.string(),
    number: z.string(),
  }).optional(),
  user_type: z.enum(['normal', 'brand', 'company']),
  tags: z.array(z.string()),
  logo: z.string().url().optional(),
  points: z.number(),
  site_id: z.string(),
  permalink: z.string().url(),
});

// =====================================================
// ORDER SCHEMAS
// =====================================================

export const MeliOrderItemSchema = z.object({
  item: z.object({
    id: z.string(),
    title: z.string(),
    category_id: z.string(),
    variation_id: z.number().optional(),
    seller_custom_field: z.string().optional(),
    variation_attributes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      value_id: z.string().optional(),
      value_name: z.string(),
    })).optional(),
  }),
  quantity: z.number(),
  unit_price: z.number(),
  full_unit_price: z.number().optional(),
  currency_id: z.string(),
  manufacturing_days: z.number().optional(),
  sale_fee: z.number().optional(),
  listing_type_id: z.string(),
});

export const MeliOrderPaymentSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  payer_id: z.number(),
  collector: z.object({
    id: z.number(),
  }),
  currency_id: z.string(),
  status: z.enum(['pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back']),
  status_detail: z.string().optional(),
  status_code: z.string().optional(),
  date_created: z.string(),
  date_last_updated: z.string(),
  date_of_expiration: z.string().optional(),
  money_release_date: z.string().optional(),
  operation_type: z.enum(['regular_payment', 'money_transfer', 'recurring_payment', 'account_fund', 'payment_addition', 'cellphone_recharge', 'pos_payment']),
  issuer_id: z.string().optional(),
  payment_method_id: z.string(),
  payment_type: z.enum(['account_money', 'ticket', 'bank_transfer', 'atm', 'credit_card', 'debit_card', 'prepaid_card']),
  token: z.string().optional(),
  transaction_amount: z.number(),
  transaction_amount_refunded: z.number(),
  coupon_amount: z.number(),
  shipping_cost: z.number().optional(),
  finance_fee: z.number().optional(),
  coupon_id: z.string().optional(),
  installments: z.number(),
  deferred_period: z.string().optional(),
  card: z.object({
    id: z.string().optional(),
    last_four_digits: z.string().optional(),
    first_six_digits: z.string().optional(),
    expiration_month: z.number().optional(),
    expiration_year: z.number().optional(),
    cardholder: z.object({
      name: z.string().optional(),
      identification: z.object({
        type: z.string(),
        number: z.string(),
      }).optional(),
    }).optional(),
  }).optional(),
});

export const MeliOrderShippingSchema = z.object({
  id: z.number(),
  shipment_type: z.string(),
  mode: z.string(),
  picking_type: z.string().optional(),
  status: z.string(),
  substatus: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
  })).optional(),
  date_created: z.string(),
  last_updated: z.string(),
  tracking_number: z.string().optional(),
  tracking_method: z.string().optional(),
  service_id: z.number().optional(),
  carrier_info: z.object({
    carrier_id: z.string().optional(),
    carrier_name: z.string().optional(),
  }).optional(),
  sender_address: z.object({
    id: z.number().optional(),
    address_line: z.string(),
    street_name: z.string().optional(),
    street_number: z.string().optional(),
    comment: z.string().optional(),
    zip_code: z.string(),
    city: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
    state: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
    country: z.object({
      id: z.string(),
      name: z.string(),
    }),
    neighborhood: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    municipality: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    agency: z.string().optional(),
  }).optional(),
  receiver_address: z.object({
    id: z.number().optional(),
    address_line: z.string(),
    street_name: z.string().optional(),
    street_number: z.string().optional(),
    comment: z.string().optional(),
    zip_code: z.string(),
    city: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
    state: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
    country: z.object({
      id: z.string(),
      name: z.string(),
    }),
    neighborhood: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    municipality: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    agency: z.string().optional(),
  }),
});

export const MeliOrderBuyerSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  email: z.string().email().optional(),
  phone: z.object({
    area_code: z.string(),
    number: z.string(),
    extension: z.string().optional(),
    verified: z.boolean().optional(),
  }).optional(),
  alternative_phone: z.object({
    area_code: z.string(),
    number: z.string(),
    extension: z.string().optional(),
  }).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  billing_info: z.object({
    doc_type: z.string(),
    doc_number: z.string(),
  }).optional(),
});

export const MeliOrderSchema = z.object({
  id: z.number(),
  status: z.enum(['confirmed', 'payment_required', 'payment_in_process', 'paid', 'shipped', 'delivered', 'cancelled']),
  status_detail: z.string().optional(),
  date_created: z.string(),
  date_closed: z.string().optional(),
  last_updated: z.string(),
  mediations: z.array(z.any()).optional(),
  fulfillment: z.object({
    id: z.string().optional(),
    status: z.string().optional(),
    fulfillment_id: z.string().optional(),
  }).optional(),
  total_amount: z.number(),
  currency_id: z.string(),
  buyer: MeliOrderBuyerSchema,
  seller: z.object({
    id: z.number(),
    nickname: z.string(),
    email: z.string().email().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }),
  payments: z.array(MeliOrderPaymentSchema),
  feedback: z.object({
    purchase: z.string().optional(),
    sale: z.string().optional(),
  }).optional(),
  shipping: MeliOrderShippingSchema.optional(),
  order_items: z.array(MeliOrderItemSchema),
  order_request: z.object({
    return: z.string().optional(),
    change: z.string().optional(),
  }).optional(),
  expiration_date: z.string().optional(),
  application_id: z.string().optional(),
  is_archived: z.boolean().optional(),
  order_type: z.string().optional(),
});

export const MeliOrderSearchResponseSchema = z.object({
  query: z.string().optional(),
  display: z.string().optional(),
  paging: z.object({
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
    primary_results: z.number().optional(),
  }),
  results: z.array(z.number()), // Array of order IDs
  sort: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  available_sorts: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
});

// =====================================================
// LISTING SCHEMAS
// =====================================================

export const MeliListingAttributeSchema = z.object({
  id: z.string(),
  name: z.string(),
  value_id: z.string().optional(),
  value_name: z.string().optional(),
  value_struct: z.object({
    number: z.number().optional(),
    unit: z.string().optional(),
  }).optional(),
  values: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    struct: z.object({
      number: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
  })).optional(),
  attribute_group_id: z.string().optional(),
  attribute_group_name: z.string().optional(),
});

export const MeliListingPictureSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  secure_url: z.string().url(),
  size: z.string(),
  max_size: z.string(),
  quality: z.string(),
});

export const MeliListingVariationSchema = z.object({
  id: z.number(),
  price: z.number(),
  attribute_combinations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value_id: z.string().optional(),
    value_name: z.string(),
  })),
  available_quantity: z.number(),
  sold_quantity: z.number(),
  picture_ids: z.array(z.string()).optional(),
  seller_custom_field: z.string().optional(),
});

export const MeliListingSchema = z.object({
  id: z.string(),
  site_id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  seller_id: z.number(),
  category_id: z.string(),
  official_store_id: z.number().optional(),
  price: z.number(),
  base_price: z.number(),
  original_price: z.number().optional(),
  currency_id: z.string(),
  initial_quantity: z.number(),
  available_quantity: z.number(),
  sold_quantity: z.number(),
  sale_terms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value_id: z.string().optional(),
    value_name: z.string().optional(),
    value_struct: z.object({
      number: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
    values: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      struct: z.object({
        number: z.number().optional(),
        unit: z.string().optional(),
      }).optional(),
    })).optional(),
  })).optional(),
  buying_mode: z.enum(['buy_it_now', 'auction']),
  listing_type_id: z.enum(['gold_special', 'gold_pro', 'gold', 'silver', 'bronze', 'free']),
  condition: z.enum(['new', 'used', 'not_specified']),
  permalink: z.string().url(),
  thumbnail_id: z.string().optional(),
  thumbnail: z.string().url().optional(),
  secure_thumbnail: z.string().url().optional(),
  pictures: z.array(MeliListingPictureSchema).optional(),
  video_id: z.string().optional(),
  descriptions: z.array(z.object({
    id: z.string(),
  })).optional(),
  accepts_mercadopago: z.boolean(),
  non_mercado_pago_payment_methods: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.string(),
  })).optional(),
  shipping: z.object({
    mode: z.string(),
    methods: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    dimensions: z.string().optional(),
    local_pick_up: z.boolean().optional(),
    free_shipping: z.boolean().optional(),
    logistic_type: z.string().optional(),
    store_pick_up: z.boolean().optional(),
  }).optional(),
  international_delivery_mode: z.string().optional(),
  seller_address: z.object({
    city: z.object({
      id: z.string(),
      name: z.string(),
    }),
    state: z.object({
      id: z.string(),
      name: z.string(),
    }),
    country: z.object({
      id: z.string(),
      name: z.string(),
    }),
    search_location: z.object({
      neighborhood: z.object({
        id: z.string(),
        name: z.string(),
      }),
      city: z.object({
        id: z.string(),
        name: z.string(),
      }),
      state: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
    id: z.number(),
  }).optional(),
  seller_contact: z.object({
    contact: z.string().optional(),
    other_info: z.string().optional(),
    area_code: z.string().optional(),
    phone: z.string().optional(),
    area_code2: z.string().optional(),
    phone2: z.string().optional(),
    email: z.string().email().optional(),
    webpage: z.string().url().optional(),
  }).optional(),
  location: z.object({}).optional(),
  coverage_areas: z.array(z.any()).optional(),
  attributes: z.array(MeliListingAttributeSchema).optional(),
  variations: z.array(MeliListingVariationSchema).optional(),
  status: z.enum(['active', 'paused', 'closed', 'under_review', 'inactive']),
  sub_status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  warranty: z.string().optional(),
  catalog_product_id: z.string().optional(),
  domain_id: z.string().optional(),
  parent_item_id: z.string().optional(),
  differential_pricing: z.object({
    id: z.number(),
  }).optional(),
  deal_ids: z.array(z.string()).optional(),
  automatic_relist: z.boolean().optional(),
  date_created: z.string(),
  last_updated: z.string(),
  health: z.number().optional(),
  catalog_listing: z.boolean().optional(),
  channels: z.array(z.string()).optional(),
});

// =====================================================
// FEES SCHEMAS
// =====================================================

export const MeliFeeDetailSchema = z.object({
  type: z.enum(['listing', 'sale', 'shipping', 'financing', 'special_discount', 'promotion']),
  fee_amount: z.number(),
  currency_id: z.string(),
  percentage: z.number().optional(),
});

export const MeliFeesResponseSchema = z.object({
  listing_fees: z.array(MeliFeeDetailSchema),
  sale_fees: z.array(MeliFeeDetailSchema),
});

// =====================================================
// WEBHOOK SCHEMAS
// =====================================================

export const MeliWebhookNotificationSchema = z.object({
  _id: z.string(),
  resource: z.string(), // /orders/123456, /items/MLB123456
  user_id: z.number(),
  topic: z.enum(['orders', 'items', 'questions', 'claims']),
  application_id: z.number(),
  attempts: z.number(),
  sent: z.string(), // ISO date
  received: z.string(), // ISO date
});

// =====================================================
// SYNC & TRIGGER SCHEMAS
// =====================================================

export const MeliSyncTriggerSchema = z.object({
  resource: z.enum(['orders', 'listings', 'inventory', 'fees', 'all']),
  force: z.boolean().default(false),
  filters: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    status: z.string().optional(),
    offset: z.number().min(0).optional(),
    limit: z.number().min(1).max(200).optional(),
  }).optional(),
});

export const MeliSyncStatusSchema = z.object({
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

export const MeliApiErrorSchema = z.object({
  message: z.string(),
  error: z.string(),
  status: z.number(),
  cause: z.array(z.object({
    code: z.string(),
    description: z.string(),
  })).optional(),
});

// =====================================================
// INTERNAL MAPPING SCHEMAS
// =====================================================

export const MeliListingMappingSchema = z.object({
  company_id: z.string().uuid(),
  meli_id: z.string(),
  internal_sku: z.string(),
  listing_type: z.string(),
  status: z.enum(['active', 'paused', 'closed']),
  sync_enabled: z.boolean().default(true),
});

export const MeliIntegrationConfigSchema = z.object({
  company_id: z.string().uuid(),
  user_id: z.string(),
  site_id: z.string().default('MLB'),
  sync_enabled: z.boolean().default(true),
  webhook_enabled: z.boolean().default(false),
  sync_intervals: z.object({
    orders: z.number().min(60).default(900),     // 15 minutes
    listings: z.number().min(60).default(3600),  // 1 hour
    inventory: z.number().min(60).default(1800), // 30 minutes
    fees: z.number().min(60).default(7200),      // 2 hours
  }).default({}),
  filters: z.object({
    order_statuses: z.array(z.string()).default([]),
    listing_statuses: z.array(z.string()).default(['active']),
    date_range_days: z.number().min(1).max(365).default(90),
  }).default({}),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type MeliOAuthConfig = z.infer<typeof MeliOAuthConfigSchema>;
export type MeliTokenResponse = z.infer<typeof MeliTokenResponseSchema>;
export type MeliUser = z.infer<typeof MeliUserSchema>;
export type MeliOrder = z.infer<typeof MeliOrderSchema>;
export type MeliOrderItem = z.infer<typeof MeliOrderItemSchema>;
export type MeliOrderPayment = z.infer<typeof MeliOrderPaymentSchema>;
export type MeliOrderShipping = z.infer<typeof MeliOrderShippingSchema>;
export type MeliListing = z.infer<typeof MeliListingSchema>;
export type MeliListingVariation = z.infer<typeof MeliListingVariationSchema>;
export type MeliFeeDetail = z.infer<typeof MeliFeeDetailSchema>;
export type MeliFeesResponse = z.infer<typeof MeliFeesResponseSchema>;
export type MeliWebhookNotification = z.infer<typeof MeliWebhookNotificationSchema>;
export type MeliSyncTrigger = z.infer<typeof MeliSyncTriggerSchema>;
export type MeliSyncStatus = z.infer<typeof MeliSyncStatusSchema>;
export type MeliListingMapping = z.infer<typeof MeliListingMappingSchema>;
export type MeliIntegrationConfig = z.infer<typeof MeliIntegrationConfigSchema>;
