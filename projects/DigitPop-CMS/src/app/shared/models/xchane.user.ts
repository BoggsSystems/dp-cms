export class XchaneUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  credits: number;
  welcomed: boolean;
  approved: boolean;
  tour: boolean;
  verified: boolean;
  referrerCode: string;
  token?: any;
}
