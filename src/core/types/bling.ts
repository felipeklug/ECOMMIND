/**
 * Bling API Types and Interfaces
 * Type definitions for Bling ERP integration
 */

// Base pagination interface
export interface Page<T> {
  data: T[];
  hasMore: boolean;
  cursor?: string;
  page?: number;
  totalPages?: number;
  totalItems?: number;
}

// OAuth token response
export interface BlingTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Encrypted token storage
export interface EncryptedTokenData {
  access_token: {
    cipher: string;
    iv: string;
    tag: string;
  };
  refresh_token: {
    cipher: string;
    iv: string;
    tag: string;
  };
  expires_at: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

// Integration status
export interface IntegrationStatus {
  connected: boolean;
  expires_at?: string;
  scope?: string;
  last_sync?: string;
  error?: string;
}

// Bling Product (raw API response)
export interface BlingProduct {
  id: number;
  codigo: string;
  descricao: string;
  marca?: string;
  tipo?: string;
  situacao?: string;
  formato?: string;
  descricaoComplementar?: string;
  unidade?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volumes?: number;
  itensPorCaixa?: number;
  gtin?: string;
  gtinEmbalagem?: string;
  tipoProducao?: string;
  condicao?: number;
  freteGratis?: boolean;
  linkExterno?: string;
  observacoes?: string;
  descricaoFornecedor?: string;
  categoria?: {
    id: number;
    descricao: string;
  };
  estoque?: {
    minimo?: number;
    maximo?: number;
    crossdocking?: number;
    localizacao?: string;
  };
  actionEstoque?: string;
  dimensoes?: {
    largura?: number;
    altura?: number;
    profundidade?: number;
    unidadeMedida?: number;
  };
  tributacao?: {
    origem?: number;
    nFCI?: string;
    ncm?: string;
    cest?: string;
    codigoListaServicos?: string;
    spedTipoItem?: string;
    codigoItem?: string;
    percentualTributos?: number;
    valorBaseStRetido?: number;
    valorStRetido?: number;
    valorICMSSubstituto?: number;
    codigoBeneficioFiscalUF?: string;
    tipoAplicacao?: string;
    classeEnquadramentoIpi?: string;
    cnpjProdutor?: string;
    codigoSeloIpi?: string;
    quantidadeSeloIpi?: number;
    enquadramentoLegalIpi?: string;
    cst?: string;
    aliquotaIcms?: number;
  };
  midia?: {
    video?: {
      url?: string;
    };
    imagens?: {
      externas?: Array<{
        link: string;
      }>;
    };
  };
  linhaProduto?: {
    id: number;
    descricao: string;
  };
  estrutura?: {
    tipoEstrutura?: string;
    lancamentoEstoque?: number;
    componentes?: Array<{
      produto: {
        id: number;
        nome: string;
        codigo: string;
        preco: number;
      };
      quantidade: number;
    }>;
  };
  fornecedor?: {
    id: number;
    nome: string;
    codigo?: string;
    precoCusto?: number;
    precoCompra?: number;
  };
  deposito?: {
    id: number;
    descricao: string;
    saldo: number;
    saldoVirtual: number;
    custoMedio: number;
  };
  variacoes?: Array<{
    id: number;
    nome: string;
    codigo: string;
    gtin: string;
    gtinEmbalagem: string;
    situacao: string;
    formato: string;
    descricaoComplementar: string;
    unidade: string;
    pesoLiquido: number;
    pesoBruto: number;
    volumes: number;
    itensPorCaixa: number;
    localizacao: string;
    crossdocking: number;
    condicao: number;
    freteGratis: boolean;
    linkExterno: string;
    observacoes: string;
    imagemURL: string;
    estoque: {
      minimo: number;
      maximo: number;
      crossdocking: number;
      localizacao: string;
    };
    dimensoes: {
      largura: number;
      altura: number;
      profundidade: number;
      unidadeMedida: number;
    };
    variacao: {
      nome: string;
      ordem: number;
      produtoVariacaoPai: {
        cloneInfo: boolean;
      };
    };
    deposito: {
      id: number;
      descricao: string;
      saldo: number;
      saldoVirtual: number;
      custoMedio: number;
    };
  }>;
  dataInclusao?: string;
  dataAlteracao?: string;
}

// Bling Order (raw API response)
export interface BlingOrder {
  id: number;
  numero: string;
  numeroLoja?: string;
  data: string;
  dataSaida?: string;
  dataPrevista?: string;
  totalProdutos: number;
  total: number;
  situacao: {
    id: number;
    valor: number;
    nome: string;
  };
  loja?: {
    id: number;
    nome: string;
  };
  numeroPedidoLoja?: string;
  checksum?: string;
  vendedor?: {
    id: number;
    nome: string;
  };
  contato: {
    id: number;
    nome: string;
    numeroDocumento?: string;
    telefone?: string;
    celular?: string;
    email?: string;
    endereco?: {
      endereco?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cep?: string;
      municipio?: string;
      uf?: string;
      pais?: string;
    };
  };
  itens: Array<{
    id: number;
    codigo: string;
    unidade: string;
    quantidade: number;
    desconto: number;
    valor: number;
    aliquotaIPI?: number;
    descricao: string;
    descricaoDetalhada?: string;
    produto?: {
      id: number;
      nome: string;
      codigo: string;
      preco: number;
      tipo: string;
      situacao: string;
      formato: string;
      descricaoComplementar: string;
      unidade: string;
      pesoLiquido: number;
      pesoBruto: number;
      volumes: number;
      itensPorCaixa: number;
      gtin: string;
      gtinEmbalagem: string;
      tipoProducao: string;
      condicao: number;
      freteGratis: boolean;
      linkExterno: string;
      observacoes: string;
      imagemURL: string;
    };
    comissao?: {
      base?: number;
      aliquota?: number;
      valor?: number;
    };
  }>;
  transporte?: {
    fretePorConta?: number;
    frete?: number;
    quantidadeVolumes?: number;
    pesoBruto?: number;
    prazoEntrega?: number;
    contato?: {
      id: number;
      nome: string;
      tipoPessoa: string;
    };
    endereco?: {
      endereco: string;
      numero: string;
      complemento: string;
      bairro: string;
      cep: string;
      municipio: string;
      uf: string;
      pais: string;
    };
    volumes?: Array<{
      id: number;
      servico: string;
      codigoRastreamento: string;
    }>;
  };
  parcelas?: Array<{
    id: number;
    dataVencimento: string;
    valor: number;
    observacoes: string;
    formaPagamento: {
      id: number;
      nome: string;
      tipoPagamento: number;
      situacao: number;
      fixa: boolean;
      padrao: boolean;
    };
  }>;
  observacoes?: string;
  observacoesInternas?: string;
  desconto?: {
    valor?: number;
    unidade?: string;
  };
  categoria?: {
    id: number;
    descricao: string;
  };
  tributacao?: {
    totalICMS?: number;
    totalIPI?: number;
    totalPIS?: number;
    totalCOFINS?: number;
    totalISS?: number;
  };
  dataInclusao?: string;
  dataAlteracao?: string;
}

// Mapped types for our database
export interface MappedProduct {
  company_id: string;
  sku: string;
  title: string;
  description?: string;
  product_type?: string;
  brand?: string;
  category?: string;
  weight_kg?: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  gtin?: string;
  ncm?: string;
  active: boolean;
  external_id: string;
  external_data: any;
  created_dt?: string;
  updated_dt?: string;
}

export interface MappedOrder {
  company_id: string;
  order_id: string;
  channel: string;
  order_dt: string;
  buyer_id?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  status: string;
  payment_method?: string;
  total_amount: number;
  shipping_cost?: number;
  discount?: number;
  external_id: string;
  external_data: any;
  created_dt?: string;
  updated_dt?: string;
}

export interface MappedOrderItem {
  company_id: string;
  order_id: string;
  item_seq: number;
  sku: string;
  product_title: string;
  qty: number;
  unit_price: number;
  fees_total?: number;
  shipping_cost?: number;
  discount?: number;
  ad_cost?: number;
  external_data: any;
}

// ETL run tracking
export interface ETLRun {
  id: string;
  company_id: string;
  source: string;
  started_at: string;
  finished_at?: string;
  ok: boolean;
  pages?: number;
  rows?: number;
  error?: string;
  metadata?: any;
}

// Rate limiting and retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// API Error types
export interface BlingAPIError {
  error: string;
  error_description?: string;
  status?: number;
  retryAfter?: number;
}
