// === BASE TYPES ===
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// === AUTHENTICATION ===
export interface User {
  id: number
  username: string
  email: string
  name?: string
  first_name?: string | null
  last_name?: string | null
  role_id?: number | null
  company_id?: number | null
  is_active: boolean
  email_verified: boolean
  status?: 'active' | 'inactive' | 'suspended'
  company?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role_id?: number
  company_id?: number
  is_active?: boolean
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password' | 'username'>> {
  email_verified?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// === COMPANY ===
export interface Company {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  document?: string | null
  website?: string | null
  industry?: string | null
  city?: string | null
  status: 'active' | 'inactive' | 'suspended'
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateCompanyData {
  name: string
  email?: string
  phone?: string
  document?: string
  website?: string
  industry?: string
  status?: 'active' | 'inactive' | 'suspended'
  metadata?: Record<string, any> | null
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {}

// === CUSTOMER ===
export type CustomerStatus = 'active' | 'inactive' | 'suspended'

export interface Customer {
  id: number
  company_id: number
  name: string
  email: string
  phone?: string | null
  document?: string | null
  status: CustomerStatus
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateCustomerData {
  company_id: number
  name: string
  email: string
  phone?: string
  document?: string
  status?: CustomerStatus
  metadata?: Record<string, any> | null
}

export interface UpdateCustomerData extends Partial<Omit<CreateCustomerData, 'company_id'>> {}

// === CUSTOMER ADDRESS ===
export type AddressType = 'billing' | 'shipping' | 'both'

export interface CustomerAddress {
  id: number
  customer_id: number
  street?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  type: AddressType
  is_default: boolean
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateCustomerAddressData {
  customerId: number // Note: API expects customerId in camelCase
  street?: string
  city?: string
  state?: string
  zipCode?: string // Note: API expects zipCode in camelCase
  country?: string
  type: AddressType
  isDefault?: boolean // Note: API expects isDefault in camelCase
  metadata?: Record<string, any> | null
}

export interface UpdateCustomerAddressData extends Partial<Omit<CreateCustomerAddressData, 'customerId'>> {}

// === FORM TYPES ===
export interface CompanyFormData extends CreateCompanyData {}
export interface CustomerFormData extends CreateCustomerData {}
export interface CustomerAddressFormData extends CreateCustomerAddressData {}

// === FILTER TYPES ===
export interface CompanyFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface CustomerFilters {
  page?: number
  limit?: number
  search?: string
  company_id?: number
  status?: CustomerStatus
}

export interface CustomerAddressFilters {
  page?: number
  limit?: number
  customer_id?: number
  type?: AddressType
  is_default?: boolean
}

// === TABLE TYPES ===
export interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: Pagination | null
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  customActions?: (item: T) => React.ReactNode
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: Pagination | null
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

// === STORE TYPES ===
export interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export interface CompanyStore {
  companies: Company[]
  selectedCompany: Company | null
  loading: boolean
  filters: CompanyFilters
  pagination: Pagination | null
  
  // Actions
  fetchCompanies: (filters?: CompanyFilters) => Promise<void>
  createCompany: (data: CreateCompanyData) => Promise<Company>
  updateCompany: (id: number, data: UpdateCompanyData) => Promise<Company>
  deleteCompany: (id: number) => Promise<void>
  setSelectedCompany: (company: Company | null) => void
  setFilters: (filters: Partial<CompanyFilters>) => void
}

export interface CustomerStore {
  customers: Customer[]
  selectedCustomer: Customer | null
  addresses: CustomerAddress[]
  loading: boolean
  filters: CustomerFilters
  pagination: Pagination | null
  
  // Actions
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>
  createCustomer: (data: CreateCustomerData) => Promise<Customer>
  updateCustomer: (id: number, data: UpdateCustomerData) => Promise<Customer>
  deleteCustomer: (id: number) => Promise<void>
  setSelectedCustomer: (customer: Customer | null) => void
  
  // Address Actions
  fetchCustomerAddresses: (customerId: number) => Promise<void>
  createCustomerAddress: (data: CreateCustomerAddressData) => Promise<CustomerAddress>
  updateCustomerAddress: (id: number, data: UpdateCustomerAddressData) => Promise<CustomerAddress>
  deleteCustomerAddress: (id: number) => Promise<void>
  setDefaultAddress: (id: number, customerId: number) => Promise<void>
  
  setFilters: (filters: Partial<CustomerFilters>) => void
}

// === PERMISSION ===
export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface CreatePermissionData {
  name: string
  resource: string
  action: string
  description?: string | null
}

export interface UpdatePermissionData extends Partial<CreatePermissionData> {}

// === ROLE ===
export interface Role {
  id: number
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface CreateRoleData {
  name: string
  description?: string | null
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

// === LOG ===
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export type LogSource = 'frontend' | 'backend'

export interface Log {
  id: number
  level: LogLevel
  message: string
  meta?: Record<string, any> | null
  source?: LogSource
  created_at: string
  updated_at: string
}

export interface CreateLogData {
  level: LogLevel
  message: string
  meta?: Record<string, any> | null
  source: LogSource
}

export interface UpdateLogData extends Partial<CreateLogData> {}

// === ROLE PERMISSION ===
export interface RolePermission {
  id: number
  role_id: number
  permission_id: number
  created_at: string
  updated_at: string
}

export interface RolePermissionDetailed {
  id: number
  role_id: number
  role_name: string
  permission_id: number
  permission_name: string
  permission_resource: string
  permission_action: string
  permission_description?: string | null
  created_at: string
  updated_at: string
}

export interface CreateRolePermissionData {
  role_id: number
  permission_id: number
}

export interface SetRolePermissionsData {
  permission_ids: number[]
}

// === USER ROLE ===
export interface UserRole {
  id: number
  user_id: number
  role_id: number
  created_at: string
  updated_at: string
}

export interface UserRoleDetailed {
  id: number
  user_id: number
  user_name?: string
  user_email?: string
  role_id: number
  role_name?: string
  role_description?: string
  created_at: string
  updated_at: string
}

export interface CreateUserRoleData {
  user_id: number
  role_id: number
}

// === FILTER TYPES FOR NEW ENTITIES ===
export interface PermissionFilters {
  page?: number
  limit?: number
  search?: string
  resource?: string
  action?: string
}

export interface RoleFilters {
  page?: number
  limit?: number
  search?: string
}

export interface LogFilters {
  page?: number
  limit?: number
  level?: LogLevel
  message?: string
  source?: LogSource
  dateFrom?: string
  dateTo?: string
}

export interface RolePermissionFilters {
  page?: number
  limit?: number
  role_id?: number
  permission_id?: number
}

export interface UserRoleFilters {
  page?: number
  limit?: number
  user_id?: number
  role_id?: number
}

// === STORE TYPES FOR NEW ENTITIES ===
export interface PermissionStore {
  permissions: Permission[]
  selectedPermission: Permission | null
  loading: boolean
  filters: PermissionFilters
  pagination: Pagination | null
  
  fetchPermissions: (filters?: PermissionFilters) => Promise<void>
  createPermission: (data: CreatePermissionData) => Promise<Permission>
  updatePermission: (id: number, data: UpdatePermissionData) => Promise<Permission>
  deletePermission: (id: number) => Promise<void>
  setSelectedPermission: (permission: Permission | null) => void
  setFilters: (filters: Partial<PermissionFilters>) => void
}

export interface RoleStore {
  roles: Role[]
  selectedRole: Role | null
  loading: boolean
  filters: RoleFilters
  pagination: Pagination | null
  
  fetchRoles: (filters?: RoleFilters) => Promise<void>
  createRole: (data: CreateRoleData) => Promise<Role>
  updateRole: (id: number, data: UpdateRoleData) => Promise<Role>
  deleteRole: (id: number) => Promise<void>
  setSelectedRole: (role: Role | null) => void
  setFilters: (filters: Partial<RoleFilters>) => void
}

export interface LogStore {
  logs: Log[]
  selectedLog: Log | null
  loading: boolean
  filters: LogFilters
  pagination: Pagination | null
  
  fetchLogs: (filters?: LogFilters) => Promise<void>
  createLog: (data: CreateLogData) => Promise<Log>
  updateLog: (id: number, data: UpdateLogData) => Promise<Log>
  deleteLog: (id: number) => Promise<void>
  setSelectedLog: (log: Log | null) => void
  setFilters: (filters: Partial<LogFilters>) => void
}

export interface RolePermissionStore {
  rolePermissions: RolePermissionDetailed[]
  selectedRolePermission: RolePermissionDetailed | null
  loading: boolean
  filters: RolePermissionFilters
  pagination: Pagination | null
  
  fetchRolePermissions: (filters?: RolePermissionFilters) => Promise<void>
  fetchRolePermissionsByRole: (roleId: number) => Promise<void>
  fetchRolePermissionsByPermission: (permissionId: number) => Promise<void>
  createRolePermission: (data: CreateRolePermissionData) => Promise<RolePermission>
  setRolePermissions: (roleId: number, data: SetRolePermissionsData) => Promise<void>
  deleteRolePermission: (id: number) => Promise<void>
  setSelectedRolePermission: (rolePermission: RolePermissionDetailed | null) => void
  setFilters: (filters: Partial<RolePermissionFilters>) => void
}

export interface UserRoleStore {
  userRoles: UserRoleDetailed[]
  selectedUserRole: UserRoleDetailed | null
  loading: boolean
  filters: UserRoleFilters
  pagination: Pagination | null
  
  fetchUserRoles: (filters?: UserRoleFilters) => Promise<void>
  fetchUserRolesByUser: (userId: number) => Promise<void>
  fetchUserRolesByRole: (roleId: number) => Promise<void>
  createUserRole: (data: CreateUserRoleData) => Promise<UserRole>
  deleteUserRole: (id: number) => Promise<void>
  setSelectedUserRole: (userRole: UserRoleDetailed | null) => void
  setFilters: (filters: Partial<UserRoleFilters>) => void
}

// === EMAIL TEMPLATE ===
export interface EmailTemplate {
  id: number
  name: string
  subject: string
  body: string
  type: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateEmailTemplateData {
  name: string
  subject: string
  body: string
  type: string
}

export interface UpdateEmailTemplateData extends Partial<CreateEmailTemplateData> {}

// === FILE ===
export type FileEntityType = 'user' | 'company' | 'customer' | 'subscription' | 'plan' | 'payment'

export interface File {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  path: string
  entity_type?: FileEntityType | null
  entity_id?: number | null
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateFileData {
  filename: string
  original_name: string
  mime_type: string
  size: number
  path: string
  entity_type?: FileEntityType
  entity_id?: number
  metadata?: Record<string, any>
}

export interface UpdateFileData extends Partial<Omit<CreateFileData, 'filename' | 'size' | 'path'>> {}

// === NOTIFICATION ===

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'system' | 'alert' | 'info'
  is_read: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateNotificationData {
  user_id: number
  title: string
  message: string
  type: 'system' | 'alert' | 'info'
  is_read?: boolean
}

export interface UpdateNotificationData extends Partial<Omit<CreateNotificationData, 'user_id'>> {}

// === PAYMENT ===
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'

export interface Payment {
  id: number
  customerId: number
  planId: number
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: string
  transactionId: string
  // Campos específicos do Pagar.me
  pagarme_transaction_id?: string | null
  pagarme_charge_id?: string | null
  pix_qr_code?: string | null
  pix_qr_code_url?: string | null
  pix_expires_at?: string | null
  card_last_digits?: string | null
  card_brand?: string | null
  card_holder_name?: string | null
  pagarme_metadata?: any
  fee_amount?: number
  acquirer_response_code?: string | null
  acquirer_message?: string | null
  payment_type?: 'pix' | 'credit_card' | null
  created_at: string
  updated_at: string
}

export interface CreatePaymentData {
  user_id: number
  subscription_id: number
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string
  transaction_id?: string
}

export interface UpdatePaymentData extends Partial<Omit<CreatePaymentData, 'user_id' | 'subscription_id'>> {}

// === PLAN ===
export type PlanInterval = 'monthly' | 'yearly'

export interface Plan {
  id: number
  name: string
  description?: string | null
  price: number
  currency: string
  interval: PlanInterval
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreatePlanData {
  name: string
  description?: string
  price: number
  currency: string
  interval: PlanInterval
  features?: string[]
  is_active?: boolean
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

// === SESSION ===
export interface Session {
  id: number
  user_id: number
  token: string
  ip_address?: string | null
  user_agent?: string | null
  last_activity: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSessionData {
  user_id: number
  token: string
  ip_address?: string | null
  user_agent?: string | null
  last_activity: string
  is_active?: boolean
}

export interface UpdateSessionData extends Partial<Omit<CreateSessionData, 'user_id'>> {}

// === SUBSCRIPTION ===
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending'
export type BillingCycle = 'monthly' | 'yearly'

export interface Subscription {
  id: number
  company_id?: number | null
  customer_id?: number | null
  plan_id: number
  // Campos Pagar.me
  pagarme_subscription_id?: string | null
  pagarme_customer_id?: string | null
  pagarme_card_id?: string | null
  payment_method?: 'pix' | 'credit_card' | null
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  canceled_at?: string | null
  ended_at?: string | null
  trial_start?: string | null
  trial_end?: string | null
  notes?: string | null
  auto_renew?: boolean
  is_trial?: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateSubscriptionData {
  company_id?: number | null
  customer_id?: number | null
  plan_id: number
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_start?: string | null
  trial_end?: string | null
  auto_renew?: boolean
  is_trial?: boolean
}

export interface UpdateSubscriptionData extends Partial<Omit<CreateSubscriptionData, 'company_id' | 'customer_id'>> {}

// === FILTER TYPES FOR NEW ENTITIES ===
export interface EmailTemplateFilters {
  page?: number
  limit?: number
  name?: string
  subject?: string
  type?: string
}

export interface FileFilters {
  page?: number
  limit?: number
  filename?: string
  original_name?: string
  mime_type?: string
  entity_type?: FileEntityType
  entity_id?: number
}

export interface NotificationFilters {
  page?: number
  limit?: number
  user_id?: number
  title?: string
  type?: 'system' | 'alert' | 'info'
  is_read?: boolean
}

export interface PaymentFilters {
  page?: number
  limit?: number
  user_id?: number
  subscription_id?: number
  status?: PaymentStatus
  start_date?: string
  end_date?: string
}

export interface PlanFilters {
  page?: number
  limit?: number
  name?: string
  price?: number
  is_active?: boolean
}

export interface SessionFilters {
  page?: number
  limit?: number
  user_id?: number
  is_active?: boolean
  ip_address?: string
}

export interface SubscriptionFilters {
  page?: number
  limit?: number
  status?: SubscriptionStatus
  plan_id?: number
  company_id?: number
  customer_id?: number
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role_id?: number
  company_id?: number
  is_active?: boolean
}

// === STORE TYPES FOR NEW ENTITIES ===
export interface EmailTemplateStore {
  emailTemplates: EmailTemplate[]
  selectedEmailTemplate: EmailTemplate | null
  loading: boolean
  filters: EmailTemplateFilters
  pagination: Pagination | null
  
  fetchEmailTemplates: (filters?: EmailTemplateFilters) => Promise<void>
  createEmailTemplate: (data: CreateEmailTemplateData) => Promise<EmailTemplate>
  updateEmailTemplate: (id: number, data: UpdateEmailTemplateData) => Promise<EmailTemplate>
  deleteEmailTemplate: (id: number) => Promise<void>
  setSelectedEmailTemplate: (emailTemplate: EmailTemplate | null) => void
  setFilters: (filters: Partial<EmailTemplateFilters>) => void
}

export interface FileStore {
  files: File[]
  selectedFile: File | null
  loading: boolean
  filters: FileFilters
  pagination: Pagination | null
  
  fetchFiles: (filters?: FileFilters) => Promise<void>
  uploadFile: (file: FormData) => Promise<File>
  updateFile: (id: number, data: UpdateFileData) => Promise<File>
  deleteFile: (id: number) => Promise<void>
  setSelectedFile: (file: File | null) => void
  setFilters: (filters: Partial<FileFilters>) => void
}

export interface NotificationStore {
  notifications: Notification[]
  selectedNotification: Notification | null
  loading: boolean
  filters: NotificationFilters
  pagination: Pagination | null
  
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>
  createNotification: (data: CreateNotificationData) => Promise<Notification>
  updateNotification: (id: number, data: UpdateNotificationData) => Promise<Notification>
  deleteNotification: (id: number) => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: (userId: number) => Promise<void>
  setSelectedNotification: (notification: Notification | null) => void
  setFilters: (filters: Partial<NotificationFilters>) => void
}

export interface PaymentStore {
  payments: Payment[]
  selectedPayment: Payment | null
  loading: boolean
  filters: PaymentFilters
  pagination: Pagination | null
  
  fetchPayments: (filters?: PaymentFilters) => Promise<void>
  createPayment: (data: CreatePaymentData) => Promise<Payment>
  updatePayment: (id: number, data: UpdatePaymentData) => Promise<Payment>
  deletePayment: (id: number) => Promise<void>
  setSelectedPayment: (payment: Payment | null) => void
  setFilters: (filters: Partial<PaymentFilters>) => void
}

export interface PlanStore {
  plans: Plan[]
  selectedPlan: Plan | null
  loading: boolean
  filters: PlanFilters
  pagination: Pagination | null
  
  fetchPlans: (filters?: PlanFilters) => Promise<void>
  createPlan: (data: CreatePlanData) => Promise<Plan>
  updatePlan: (id: number, data: UpdatePlanData) => Promise<Plan>
  deletePlan: (id: number) => Promise<void>
  setSelectedPlan: (plan: Plan | null) => void
  setFilters: (filters: Partial<PlanFilters>) => void
}

export interface SessionStore {
  sessions: Session[]
  selectedSession: Session | null
  loading: boolean
  filters: SessionFilters
  pagination: Pagination | null
  
  fetchSessions: (filters?: SessionFilters) => Promise<void>
  createSession: (data: CreateSessionData) => Promise<Session>
  updateSession: (id: number, data: UpdateSessionData) => Promise<Session>
  deleteSession: (id: number) => Promise<void>
  setSelectedSession: (session: Session | null) => void
  setFilters: (filters: Partial<SessionFilters>) => void
}

export interface SubscriptionStore {
  subscriptions: Subscription[]
  selectedSubscription: Subscription | null
  loading: boolean
  filters: SubscriptionFilters
  pagination: Pagination | null
  
  fetchSubscriptions: (filters?: SubscriptionFilters) => Promise<void>
  createSubscription: (data: CreateSubscriptionData) => Promise<Subscription>
  updateSubscription: (id: number, data: UpdateSubscriptionData) => Promise<Subscription>
  deleteSubscription: (id: number) => Promise<void>
  setSelectedSubscription: (subscription: Subscription | null) => void
  setFilters: (filters: Partial<SubscriptionFilters>) => void
}

// === SETTING ===
export type SettingType = 'string' | 'number' | 'boolean' | 'json'

export interface Setting {
  id: number
  key: string
  value: string
  type: SettingType
  description?: string | null
  created_at: string
  updated_at: string
}

export interface CreateSettingData {
  key: string
  value: string
  type?: SettingType
  description?: string
}

export interface UpdateSettingData extends Partial<Omit<CreateSettingData, 'key'>> {}

export interface SettingFilters {
  page?: number
  limit?: number
  key?: string
  type?: SettingType
}

export interface SettingStore {
  settings: Setting[]
  selectedSetting: Setting | null
  loading: boolean
  filters: SettingFilters
  pagination: Pagination | null
  
  fetchSettings: (filters?: SettingFilters) => Promise<void>
  createSetting: (data: CreateSettingData) => Promise<Setting>
  updateSetting: (id: number, data: UpdateSettingData) => Promise<Setting>
  deleteSetting: (id: number) => Promise<void>
  setSelectedSetting: (setting: Setting | null) => void
  setFilters: (filters: Partial<SettingFilters>) => void
}

export interface UserStore {
  users: User[]
  selectedUser: User | null
  loading: boolean
  filters: UserFilters
  pagination: Pagination | null
  
  fetchUsers: (filters?: UserFilters) => Promise<void>
  createUser: (data: CreateUserData) => Promise<User>
  updateUser: (id: number, data: UpdateUserData) => Promise<User>
  deleteUser: (id: number) => Promise<void>
  setSelectedUser: (user: User | null) => void
  setFilters: (filters: Partial<UserFilters>) => void
}

// === FORM FIELD TYPES ===
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'datetime-local'
  required?: boolean
  placeholder?: string
  description?: string
  defaultValue?: any
  options?: { value: string | number; label: string }[]
  rows?: number
}

export interface MetadataFieldProps {
  label: string
  value: React.ReactNode
  onChange: (value: any) => void
}

// === CHECKOUT TYPES ===
export * from './checkout'