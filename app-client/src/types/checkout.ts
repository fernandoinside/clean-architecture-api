// Tipos para checkout e pagamentos

export interface CustomerData {
  name: string;
  email: string;
  document: string;
  phone?: {
    country_code: string;
    area_code: string;
    number: string;
  };
  address?: {
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface CardData {
  number: string;
  holder_name: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

export interface PIXPaymentRequest {
  plan_id: number;
  subscription_type: 'company' | 'customer';
  company_id?: number;
  customer_id?: number;
  customer_data: CustomerData;
  expires_in?: number;
}

export interface CardPaymentRequest {
  plan_id: number;
  subscription_type: 'company' | 'customer';
  company_id?: number;
  customer_id?: number;
  customer_data: CustomerData;
  card_data: CardData;
  billing_address?: {
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface PIXPaymentResponse {
  payment_id: number;
  transaction_id: string;
  pix_qr_code: string;
  pix_qr_code_url: string;
  expires_at: string;
  amount: number;
  plan: {
    id: number;
    name: string;
    price: number;
  };
}

export interface CardPaymentResponse {
  payment_id: number;
  transaction_id: string;
  status: 'approved' | 'failed';
  subscription_id?: number;
  message: string;
  acquirer_message?: string;
}

export interface PaymentStatus {
  payment_id: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  payment_type: 'pix' | 'credit_card';
  created_at: string;
  updated_at: string;
  pix_data?: {
    qr_code?: string;
    qr_code_url?: string;
    expires_at?: string;
  };
}

export interface CheckoutConfig {
  public_key: string;
  supported_methods: string[];
}

export interface CheckoutFormData {
  plan_id: number;
  subscription_type: 'company' | 'customer';
  company_id?: number;
  customer_id?: number;
  payment_method: 'pix' | 'credit_card';
  customer_data: CustomerData;
  card_data?: CardData;
  billing_address?: CustomerData['address'];
}

export type PaymentMethod = 'pix' | 'credit_card';
export type SubscriptionType = 'company' | 'customer';
export type PaymentStatusType = 'pending' | 'completed' | 'failed';

// Estado do processo de checkout
export interface CheckoutState {
  // Estado geral
  loading: boolean;
  error: string | null;
  step: 'form' | 'processing' | 'pix_waiting' | 'success' | 'error';
  
  // Dados do formulário
  formData: Partial<CheckoutFormData>;
  
  // Configurações
  config: CheckoutConfig | null;
  
  // Resposta do pagamento atual
  currentPayment: PIXPaymentResponse | CardPaymentResponse | null;
  paymentStatus: PaymentStatus | null;
  
  // Controle de polling para PIX
  pollingInterval: NodeJS.Timeout | null;
}

export interface CheckoutStore extends CheckoutState {
  // Actions
  setFormData: (data: Partial<CheckoutFormData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStep: (step: CheckoutState['step']) => void;
  
  // API calls
  loadConfig: () => Promise<void>;
  createPIXPayment: (data: PIXPaymentRequest) => Promise<PIXPaymentResponse>;
  createCardPayment: (data: CardPaymentRequest) => Promise<CardPaymentResponse>;
  checkPaymentStatus: (transactionId: string) => Promise<PaymentStatus>;
  
  // Controles
  startPolling: (transactionId: string) => void;
  stopPolling: () => void;
  reset: () => void;
  
  // Validações
  canSubmit: () => boolean;
}

// Validação de cartão
export interface CardValidation {
  number: {
    isValid: boolean;
    message?: string;
  };
  expiry: {
    isValid: boolean;
    message?: string;
  };
  cvv: {
    isValid: boolean;
    message?: string;
  };
  holderName: {
    isValid: boolean;
    message?: string;
  };
}

// Props dos componentes
export interface CheckoutFormProps {
  planId: number;
  subscriptionType: SubscriptionType;
  entityId?: number;
  onSuccess?: (payment: PIXPaymentResponse | CardPaymentResponse) => void;
  onError?: (error: string) => void;
}

export interface PIXPaymentProps {
  payment: PIXPaymentResponse;
  onPaymentComplete?: () => void;
  onExpired?: () => void;
}

export interface CardPaymentProps {
  onSubmit: (cardData: CardData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface AddressFormProps {
  address: CustomerData['address'];
  onChange: (address: CustomerData['address']) => void;
  required?: boolean;
}