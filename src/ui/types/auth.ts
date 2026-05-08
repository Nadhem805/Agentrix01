export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'agency'

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  isEmailVerified: boolean
  subscriptionStatus: SubscriptionStatus
  subscriptionPlan: SubscriptionPlan
  subscriptionExpiresAt?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  companyName?: string
}

export interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
