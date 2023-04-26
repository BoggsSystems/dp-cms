export interface Plan {
  planId: number;
  name: string;
  displayName: string;
  description: string;
  pricingModelType: string;
  productId: number;
  cycles: Cycle[];
  addons: any[];
  allowances: any[];
  featureTags: any[];
  visibility: string;
  redirectUrl: string;
  hasActiveSubscription: boolean;
  alertEmail: string;
  isPlanImageEnabled: boolean;
  planImageUrl: string;
  planImageFileName: null | string;
}

interface PricingModel {
  price: number;
  priceFormatted: string;
  pricingModelId: number;
  frequency: number;
  frequencyType: string;
  freeTrial: number;
  freeTrialFrequencyType: string;
  contractTerm: null;
  contractTermFrequencyType: string;
  setupFeePrice: null;
  setupFeePriceFormatted: null;
  freeQuantity: number;
  billingDateType: string;
  fixedBillingDateDay: number | null;
  fixedBillingDateMonth: null | string;
  proRateOption: string;
}

interface Cycle {
  cycleId: number;
  planId: number;
  pricingModel: PricingModel;
  visibility: string;
}
