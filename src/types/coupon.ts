import { Moment } from 'moment';

export interface CouponState {
  name: string;
  source: string;
  target: string;
  goods: string;
  type: string;
  validTime: [Moment, Moment];
  stock: number;
  receiveRule: string;
  consumeRule: string;
}
