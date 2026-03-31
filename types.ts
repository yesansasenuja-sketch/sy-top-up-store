export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export type DiamondPackage = {
  id: string;
  amount: number;
  price: number;
  bonus?: number;
  isPopular?: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
  balance?: number;
};

export type CartItem = {
  id: string;
  package: DiamondPackage;
  quantity: number;
  playerId: string;
  playerUsername: string;
};

export type UserProfile = {
  id: string;
  uid: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'apple' | 'email';
  walletBalance: number;
  role: 'user' | 'admin';
  createdAt: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    cryptoWallet?: string;
  };
};

export type Order = {
  id: string;
  date: string;
  package: DiamondPackage;
  quantity: number;
  playerId: string;
  playerUsername: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  isPartial: boolean;
  proofUrl?: string;
  customerEmail?: string;
  uid?: string;
};

export type OrderState = {
  selectedPackage: DiamondPackage | null;
  quantity: number;
  playerId: string;
  playerUsername: string;
  paymentMethod: PaymentMethod | null;
  walletBalance: number;
  isPartialPayment: boolean;
  partialAmount: number;
  remainingBalance: number;
  payingOrderId?: string;
};

export type Package = {
  id: string;
  name: string;
  price: number;
  days: number;
};

export type Subscription = {
  id: string;
  uid: string;
  packageId: string;
  endDate: string;
  status: 'active' | 'expired';
};

export type Payment = {
  id: string;
  uid: string;
  amount: number;
  transactionId: string;
  date: string;
};
