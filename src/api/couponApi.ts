import { CouponState } from '../types/coupon';

const API_BASE_URL = 'http://127.0.0.1:10001/api/merchant-admin';

export interface ApiResponse<T = unknown> {
  code: string;
  info: string;
  data: T | null;
}

export const createCouponTemplate = async (couponData: CouponState): Promise<ApiResponse> => {
  const requestBody = {
    name: couponData.name,
    source: parseInt(couponData.source),
    target: parseInt(couponData.target),
    goods: couponData.goods || null,
    type: parseInt(couponData.type),
    validStartTime: couponData.validTime[0].format('YYYY-MM-DD HH:mm:ss'),
    validEndTime: couponData.validTime[1].format('YYYY-MM-DD HH:mm:ss'),
    stock: couponData.stock,
    receiveRule: couponData.receiveRule,
    consumeRule: couponData.consumeRule,
  };

  const response = await fetch(`${API_BASE_URL}/coupon-template/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
