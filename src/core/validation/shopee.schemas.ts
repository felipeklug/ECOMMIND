/**
 * Shopee Validation Schemas
 * Zod schemas for Shopee OpenAPI v2 integration
 */

import { z } from 'zod';

// =====================================================
// OAUTH & AUTH SCHEMAS
// =====================================================

export const ShopeeOAuthConfigSchema = z.object({
  partner_id: z.string().min(1, 'Partner ID is required'),
  partner_key: z.string().min(1, 'Partner Key is required'),
  redirect_uri: z.string().url('Invalid redirect URI'),
  region: z.enum(['BR', 'SG', 'MY', 'TH', 'VN', 'PH', 'TW', 'ID']).default('BR'),
});

export const ShopeeTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number(),
  shop_id: z.number(),
  partner_id: z.number(),
});

export const ShopeeRefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
  shop_id: z.number(),
  partner_id: z.number(),
});

// =====================================================
// SHOP & USER SCHEMAS
// =====================================================

export const ShopeeShopInfoSchema = z.object({
  shop_id: z.number(),
  shop_name: z.string(),
  region: z.string(),
  status: z.enum(['NORMAL', 'BANNED', 'FROZEN']),
  sip_affi_shops: z.array(z.object({
    affi_shop_id: z.number(),
    region: z.string(),
  })).optional(),
  is_cb: z.boolean().optional(),
  is_cnsc: z.boolean().optional(),
});

// =====================================================
// ORDER SCHEMAS
// =====================================================

export const ShopeeOrderItemSchema = z.object({
  item_id: z.number(),
  item_name: z.string(),
  item_sku: z.string().optional(),
  model_id: z.number().optional(),
  model_name: z.string().optional(),
  model_sku: z.string().optional(),
  model_quantity_purchased: z.number(),
  model_original_price: z.number(),
  model_discounted_price: z.number(),
  wholesale: z.boolean().optional(),
  weight: z.number().optional(),
  add_on_deal: z.boolean().optional(),
  main_item: z.boolean().optional(),
  add_on_deal_id: z.number().optional(),
  promotion_type: z.string().optional(),
  promotion_id: z.number().optional(),
  order_item_id: z.number(),
  promotion_group_id: z.number().optional(),
  image_info: z.object({
    image_url: z.string().optional(),
  }).optional(),
  product_location_id: z.array(z.string()).optional(),
  is_prescription_item: z.boolean().optional(),
  is_b2c_voucher_cashback: z.boolean().optional(),
});

export const ShopeeOrderRecipientAddressSchema = z.object({
  name: z.string(),
  phone: z.string(),
  town: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  zipcode: z.string().optional(),
  full_address: z.string(),
});

export const ShopeeOrderSchema = z.object({
  order_sn: z.string(),
  region: z.string(),
  currency: z.string(),
  cod: z.boolean(),
  total_amount: z.number(),
  order_status: z.enum([
    'UNPAID', 'TO_CONFIRM', 'TO_SHIP', 'SHIPPED', 'TO_RETURN', 
    'COMPLETED', 'IN_CANCEL', 'CANCELLED', 'INVOICE_PENDING'
  ]),
  shipping_carrier: z.string().optional(),
  payment_method: z.string().optional(),
  estimated_shipping_fee: z.number().optional(),
  message_to_seller: z.string().optional(),
  create_time: z.number(), // Unix timestamp
  update_time: z.number(), // Unix timestamp
  days_to_ship: z.number().optional(),
  ship_by_date: z.number().optional(), // Unix timestamp
  buyer_user_id: z.number().optional(),
  buyer_username: z.string().optional(),
  dropout_date: z.number().optional(), // Unix timestamp
  dropout_reason: z.string().optional(),
  cancel_by: z.string().optional(),
  cancel_reason: z.string().optional(),
  actual_shipping_fee: z.number().optional(),
  goods_to_declare: z.boolean().optional(),
  note: z.string().optional(),
  note_update_time: z.number().optional(), // Unix timestamp
  item_list: z.array(ShopeeOrderItemSchema),
  pay_time: z.number().optional(), // Unix timestamp
  dropshipper: z.string().optional(),
  dropshipper_phone: z.string().optional(),
  split_up: z.boolean().optional(),
  buyer_cancel_reason: z.string().optional(),
  cancel_by_shopee: z.boolean().optional(),
  cancel_reason_shopee: z.string().optional(),
  recipient_address: ShopeeOrderRecipientAddressSchema.optional(),
  actual_shipping_fee_confirmed: z.boolean().optional(),
  buyer_cpf_id: z.string().optional(),
  fulfillment_flag: z.string().optional(),
  pickup_done_time: z.number().optional(), // Unix timestamp
  package_list: z.array(z.object({
    package_number: z.string(),
    logistics_status: z.string().optional(),
    shipping_carrier: z.string().optional(),
    item_list: z.array(z.object({
      item_id: z.number(),
      model_id: z.number().optional(),
      quantity: z.number(),
    })),
  })).optional(),
  invoice_data: z.object({
    number: z.string().optional(),
    series_number: z.string().optional(),
    access_key: z.string().optional(),
    issue_date: z.number().optional(), // Unix timestamp
    total_value: z.number().optional(),
    products_total_value: z.number().optional(),
    tax_total_value: z.number().optional(),
  }).optional(),
  checkout_shipping_carrier: z.string().optional(),
  reverse_shipping_fee: z.number().optional(),
  order_chargeable_weight_gram: z.number().optional(),
  edt: z.number().optional(), // Unix timestamp
});

export const ShopeeOrderListResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  warning: z.string().optional(),
  request_id: z.string().optional(),
  response: z.object({
    order_list: z.array(z.object({
      order_sn: z.string(),
      order_status: z.string(),
      update_time: z.number(),
    })),
    more: z.boolean(),
    next_cursor: z.string().optional(),
  }).optional(),
});

// =====================================================
// ITEM SCHEMAS
// =====================================================

export const ShopeeItemAttributeSchema = z.object({
  attribute_id: z.number(),
  attribute_name: z.string(),
  attribute_type: z.string(),
  attribute_value_list: z.array(z.object({
    value_id: z.number(),
    original_value_name: z.string(),
    translate_value_name: z.string(),
  })),
});

export const ShopeeItemImageSchema = z.object({
  image_id: z.string(),
  image_url: z.string().optional(),
});

export const ShopeeItemVariationSchema = z.object({
  variation_id: z.number(),
  variation_sku: z.string().optional(),
  status: z.enum(['NORMAL', 'DELETED']),
  stock: z.number(),
  price: z.number(),
  variation_tier_index: z.array(z.number()).optional(),
  is_default: z.boolean().optional(),
});

export const ShopeeItemSchema = z.object({
  item_id: z.number(),
  category_id: z.number(),
  item_name: z.string(),
  description: z.string().optional(),
  item_sku: z.string().optional(),
  create_time: z.number(), // Unix timestamp
  update_time: z.number(), // Unix timestamp
  attribute_list: z.array(ShopeeItemAttributeSchema).optional(),
  price_info: z.object({
    currency: z.string(),
    original_price: z.number(),
    current_price: z.number(),
    inflated_price_of_current_price: z.number().optional(),
    sip_item_price: z.number().optional(),
    sip_item_price_source: z.string().optional(),
  }).optional(),
  stock_info: z.object({
    stock_type: z.number(),
    stock_location_id: z.string().optional(),
    current_stock: z.number(),
    normal_stock: z.number(),
    reserved_stock: z.number(),
  }).optional(),
  image: z.object({
    image_url_list: z.array(z.string()),
    image_id_list: z.array(z.string()),
  }).optional(),
  weight: z.number().optional(),
  dimension: z.object({
    package_length: z.number().optional(),
    package_width: z.number().optional(),
    package_height: z.number().optional(),
  }).optional(),
  logistic_info: z.array(z.object({
    logistic_id: z.number(),
    logistic_name: z.string(),
    enabled: z.boolean(),
    shipping_fee: z.number().optional(),
    size_id: z.number().optional(),
    is_free: z.boolean().optional(),
  })).optional(),
  pre_order: z.object({
    is_pre_order: z.boolean(),
    days_to_ship: z.number().optional(),
  }).optional(),
  condition: z.enum(['NEW', 'USED']).optional(),
  size_chart: z.string().optional(),
  item_status: z.enum(['NORMAL', 'DELETED', 'BANNED', 'REVIEWING', 'FREEZE']),
  has_model: z.boolean(),
  promotion_id: z.number().optional(),
  video_info: z.array(z.object({
    video_url: z.string(),
    thumbnail_url: z.string(),
    duration: z.number(),
  })).optional(),
  brand: z.object({
    brand_id: z.number(),
    original_brand_name: z.string(),
  }).optional(),
  item_dangerous: z.number().optional(),
  complaint_policy: z.object({
    complaint_policy_id: z.number(),
    complaint_policy_name: z.string(),
  }).optional(),
  tax_info: z.object({
    ncm: z.string().optional(),
    same_state_cfop: z.string().optional(),
    diff_state_cfop: z.string().optional(),
    csosn: z.string().optional(),
    origin: z.number().optional(),
    cest: z.string().optional(),
  }).optional(),
  variation: z.array(ShopeeItemVariationSchema).optional(),
  tier_variation: z.array(z.object({
    name: z.string(),
    option_list: z.array(z.object({
      option: z.string(),
      image: z.object({
        image_id: z.string(),
        image_url: z.string(),
      }).optional(),
    })),
  })).optional(),
});

export const ShopeeItemListResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  warning: z.string().optional(),
  request_id: z.string().optional(),
  response: z.object({
    item: z.array(z.object({
      item_id: z.number(),
      item_status: z.string(),
      update_time: z.number(),
    })),
    total_count: z.number(),
    has_next_page: z.boolean(),
    next_offset: z.number().optional(),
  }).optional(),
});

// =====================================================
// STOCK SCHEMAS
// =====================================================

export const ShopeeStockInfoSchema = z.object({
  item_id: z.number(),
  stock_info_list: z.array(z.object({
    model_id: z.number().optional(),
    normal_stock: z.number(),
    reserved_stock: z.number(),
    current_stock: z.number(),
  })),
});

// =====================================================
// FEES SCHEMAS
// =====================================================

export const ShopeeFeeDetailSchema = z.object({
  fee_type: z.enum(['commission', 'transaction', 'payment', 'shipping', 'service']),
  fee_amount: z.number(),
  currency: z.string(),
});

export const ShopeeOrderIncomeSchema = z.object({
  order_sn: z.string(),
  order_income_list: z.array(z.object({
    item_id: z.number(),
    model_id: z.number().optional(),
    order_item_id: z.number(),
    total_amount: z.number(),
    seller_discount: z.number(),
    shopee_discount: z.number(),
    final_product_price: z.number(),
    commission_fee: z.number(),
    service_fee: z.number(),
    transaction_fee: z.number(),
    shipping_fee_discount_from_3pl: z.number().optional(),
    coins_cash_by_shopee: z.number().optional(),
    original_price: z.number(),
    deal_price: z.number(),
    actual_shipping_fee: z.number(),
    shipping_fee_discount_from_seller: z.number(),
    seller_voucher_discount: z.number(),
    escrow_amount: z.number(),
    final_shipping_fee: z.number(),
    actual_shipping_fee_confirmed: z.boolean(),
    payment_promotion: z.number(),
    commission_fee_rate: z.number(),
    is_b2c_voucher_cashback: z.boolean().optional(),
    voucher_code: z.string().optional(),
  })),
});

// =====================================================
// WEBHOOK SCHEMAS
// =====================================================

export const ShopeeWebhookEventSchema = z.object({
  shop_id: z.number(),
  timestamp: z.number(), // Unix timestamp
  data: z.object({
    order_sn: z.string().optional(),
    item_id: z.number().optional(),
    status: z.string().optional(),
    update_time: z.number().optional(),
  }),
});

// =====================================================
// SYNC & TRIGGER SCHEMAS
// =====================================================

export const ShopeeSyncTriggerSchema = z.object({
  resource: z.enum(['orders', 'listings', 'stock', 'fees', 'all']),
  force: z.boolean().default(false),
  filters: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    status: z.string().optional(),
    cursor: z.string().optional(),
    page_size: z.number().min(1).max(100).optional(),
  }).optional(),
});

export const ShopeeSyncStatusSchema = z.object({
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

export const ShopeeApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  request_id: z.string().optional(),
});

export const ShopeeApiResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  warning: z.string().optional(),
  request_id: z.string().optional(),
  response: z.any().optional(),
});

// =====================================================
// INTERNAL MAPPING SCHEMAS
// =====================================================

export const ShopeeItemMappingSchema = z.object({
  company_id: z.string().uuid(),
  shopee_item_id: z.string(),
  shopee_model_id: z.string().optional(),
  internal_sku: z.string(),
  item_name: z.string(),
  model_name: z.string().optional(),
  status: z.enum(['NORMAL', 'DELETED', 'BANNED']),
  sync_enabled: z.boolean().default(true),
});

export const ShopeeIntegrationConfigSchema = z.object({
  company_id: z.string().uuid(),
  shop_id: z.string(),
  partner_id: z.string(),
  region: z.enum(['BR', 'SG', 'MY', 'TH', 'VN', 'PH', 'TW', 'ID']).default('BR'),
  sync_enabled: z.boolean().default(true),
  webhook_enabled: z.boolean().default(false),
  sync_intervals: z.object({
    orders: z.number().min(60).default(900),     // 15 minutes
    listings: z.number().min(60).default(3600),  // 1 hour
    stock: z.number().min(60).default(1800),     // 30 minutes
    fees: z.number().min(60).default(7200),      // 2 hours
  }).default({}),
  filters: z.object({
    order_statuses: z.array(z.string()).default([]),
    item_statuses: z.array(z.string()).default(['NORMAL']),
    date_range_days: z.number().min(1).max(365).default(90),
  }).default({}),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type ShopeeOAuthConfig = z.infer<typeof ShopeeOAuthConfigSchema>;
export type ShopeeTokenResponse = z.infer<typeof ShopeeTokenResponseSchema>;
export type ShopeeShopInfo = z.infer<typeof ShopeeShopInfoSchema>;
export type ShopeeOrder = z.infer<typeof ShopeeOrderSchema>;
export type ShopeeOrderItem = z.infer<typeof ShopeeOrderItemSchema>;
export type ShopeeItem = z.infer<typeof ShopeeItemSchema>;
export type ShopeeItemVariation = z.infer<typeof ShopeeItemVariationSchema>;
export type ShopeeStockInfo = z.infer<typeof ShopeeStockInfoSchema>;
export type ShopeeFeeDetail = z.infer<typeof ShopeeFeeDetailSchema>;
export type ShopeeOrderIncome = z.infer<typeof ShopeeOrderIncomeSchema>;
export type ShopeeWebhookEvent = z.infer<typeof ShopeeWebhookEventSchema>;
export type ShopeeSyncTrigger = z.infer<typeof ShopeeSyncTriggerSchema>;
export type ShopeeSyncStatus = z.infer<typeof ShopeeSyncStatusSchema>;
export type ShopeeItemMapping = z.infer<typeof ShopeeItemMappingSchema>;
export type ShopeeIntegrationConfig = z.infer<typeof ShopeeIntegrationConfigSchema>;
