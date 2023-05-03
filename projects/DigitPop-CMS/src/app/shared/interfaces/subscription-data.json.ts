export interface SubscriptionData {
  user: string;
  billsByCid?: string;
  billsBySid?: string;
  plan: string;
  payment?: number;
  paymentMethod?: string;
  subscriptionDate: Date;
  renewalDate: Date;
}
