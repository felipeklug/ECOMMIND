// Bling API Types
// TypeScript definitions for Bling ERP API v3 responses

export interface BlingProduct {
  id: number
  nome: string
  codigo?: string
  preco: number
  precoCusto?: number
  unidade: string
  pesoLiquido?: number
  pesoBruto?: number
  volumes?: number
  itensPorCaixa?: number
  gtin?: string
  gtinEmbalagem?: string
  tipoProducao?: string
  condicao?: number
  freteGratis?: boolean
  marca?: string
  descricaoCurta?: string
  descricaoComplementar?: string
  linkExterno?: string
  observacoes?: string
  descricaoEmbalagemDiscreta?: string
  categoria?: {
    id: number
    descricao: string
  }
  estoque?: {
    minimo?: number
    maximo?: number
    crossdocking?: number
    localizacao?: string
  }
  actionEstoque?: string
  dimensoes?: {
    largura?: number
    altura?: number
    profundidade?: number
    unidadeMedida?: number
  }
  tributacao?: {
    origem?: number
    nFCI?: string
    ncm?: string
    cest?: string
    codigoListaServicos?: string
    spedTipoItem?: string
    codigoItem?: string
    percentualTributos?: number
    valorBaseStRetencao?: number
    valorStRetencao?: number
    valorICMSSubstituto?: number
    codigoExcecaoTipi?: string
    classeEnquadramentoIpi?: string
    valorIpiFixo?: number
    codigoSeloIpi?: string
    valorPisFixo?: number
    valorCofinsFixo?: number
    codigoANP?: string
    descricaoANP?: string
    percentualGLP?: number
    percentualGasNacional?: number
    percentualGasImportado?: number
    valorPartida?: number
    tipoArmamento?: number
    descricaoCompletaArmamento?: string
    dadosAdicionais?: string
  }
  midia?: {
    video?: {
      url?: string
    }
    imagens?: {
      linkMidia?: {
        url?: string
      }
    }
  }
  linhaProduto?: {
    id: number
    descricao: string
  }
  estrutura?: {
    tipoEstoque: string
    lancamentoEstoque: string
    componentes?: Array<{
      produto: {
        id: number
        nome: string
        codigo: string
      }
      quantidade: number
    }>
  }
  fornecedor?: {
    id: number
    nome: string
  }
  situacao?: string
  tipo?: string
  spedTipoItem?: string
  classe?: string
  clonarDadosPai?: boolean
}

export interface BlingOrder {
  id: number
  numero: number
  numeroLoja?: string
  data: string
  dataSaida?: string
  dataPrevista?: string
  totalProdutos: number
  totalVenda: number
  situacao: {
    id: number
    valor: number
    nome: string
    cor: string
    fontColor: string
  }
  loja?: {
    id: number
    nome: string
  }
  numeroPedidoCompra?: string
  outrasDespesas: number
  observacoes?: string
  observacoesInternas?: string
  desconto: {
    valor: number
    unidade: string
  }
  categoria?: {
    id: number
    descricao: string
  }
  tributacao?: {
    totalICMS: number
    totalIPI: number
    totalPIS: number
    totalCOFINS: number
  }
  contato: {
    id: number
    nome: string
    numeroDocumento?: string
    telefone?: string
    email?: string
    endereco?: {
      endereco?: string
      numero?: string
      complemento?: string
      bairro?: string
      cep?: string
      municipio?: string
      uf?: string
      pais?: string
    }
  }
  itens: Array<{
    id: number
    codigo?: string
    unidade: string
    quantidade: number
    desconto: number
    valor: number
    aliquotaIPI?: number
    descricao: string
    descricaoDetalhada?: string
    produto?: {
      id: number
      nome: string
      codigo?: string
      preco: number
      precoCusto?: number
      unidade: string
      pesoLiquido?: number
      pesoBruto?: number
    }
    comissao?: {
      base?: number
      aliquota?: number
      valor?: number
    }
  }>
  parcelas?: Array<{
    id: number
    dataVencimento: string
    valor: number
    observacoes?: string
    formaPagamento?: {
      id: number
      descricao: string
    }
  }>
  transporte?: {
    fretePorConta?: number
    frete?: number
    quantidadeVolumes?: number
    pesoBruto?: number
    prazoEntrega?: number
    contato?: {
      id: number
      nome: string
    }
    etiqueta?: {
      nome?: string
      endereco?: string
      numero?: string
      complemento?: string
      municipio?: string
      uf?: string
      cep?: string
      bairro?: string
    }
    volumes?: Array<{
      id: number
      servico?: string
      codigoRastreamento?: string
    }>
  }
}

export interface BlingStock {
  produto: {
    id: number
    nome: string
    codigo?: string
    unidade: string
    pesoLiquido?: number
    pesoBruto?: number
  }
  deposito: {
    id: number
    descricao: string
    situacao: string
    padrao: boolean
  }
  saldoFisicoTotal: number
  saldoVirtualTotal: number
  saldoFisico: number
  saldoVirtual: number
  custoMedio: number
  custoReal: number
}

export interface BlingReceivable {
  id: number
  situacao: {
    id: number
    nome: string
  }
  vencimento: string
  valor: number
  contato: {
    id: number
    nome: string
    numeroDocumento?: string
  }
  formaPagamento?: {
    id: number
    descricao: string
  }
  categoria?: {
    id: number
    descricao: string
  }
  vendedor?: {
    id: number
    nome: string
  }
  bordero?: {
    id: number
    descricao: string
  }
  ocorrencia?: {
    tipo: string
    data: string
    descricao: string
  }
  competencia?: string
  historico?: string
  numeroDocumento?: string
  observacoes?: string
}

export interface BlingPayable {
  id: number
  situacao: {
    id: number
    nome: string
  }
  vencimento: string
  valor: number
  contato: {
    id: number
    nome: string
    numeroDocumento?: string
  }
  formaPagamento?: {
    id: number
    descricao: string
  }
  categoria?: {
    id: number
    descricao: string
  }
  portador?: {
    id: number
    descricao: string
  }
  ocorrencia?: {
    tipo: string
    data: string
    descricao: string
  }
  competencia?: string
  historico?: string
  numeroDocumento?: string
  observacoes?: string
}

export interface BlingCategory {
  id: number
  descricao: string
  categoriaPai?: {
    id: number
    descricao: string
  }
}

export interface BlingContact {
  id: number
  nome: string
  codigo?: string
  situacao?: string
  numeroDocumento?: string
  telefone?: string
  celular?: string
  email?: string
  endereco?: {
    endereco?: string
    numero?: string
    complemento?: string
    bairro?: string
    cep?: string
    municipio?: string
    uf?: string
    pais?: string
  }
  dadosAdicionais?: {
    dataNascimento?: string
    sexo?: string
    rg?: string
    orgaoEmissor?: string
  }
  vendedor?: {
    id: number
    nome: string
  }
  tipos?: Array<{
    id: number
    descricao: string
  }>
}

// Pagination wrapper for Bling API responses
export interface BlingPaginatedResponse<T> {
  data: T[]
  pagina: number
  limite: number
  total: number
}

// Error response from Bling API
export interface BlingError {
  error: string
  description: string
}
