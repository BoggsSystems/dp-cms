export interface SubscriptionData {
  user: string;
  plan: string;
  payment?: number;
  paymentMethod?: string;
  subscriptionDate: Date;
  renewalDate: Date;
}
