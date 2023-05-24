interface Address {
  addressLine1: string;
  addressLine2: string;
  state: string;
  city: string;
  country: string;
  postCode: string;
}

interface cardDetails {
  paymentCardToken: string;
  expiryMonth: number;
  expiryYear: number;
  cardType?: string;
  last4Digits?: string;
}

export interface BusinessUser {
  _id?: string;
  cid?: string;
  subscription?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: Address;
  cardDetails: cardDetails
}
