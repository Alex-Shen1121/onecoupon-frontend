import { CouponState } from '../types/coupon';

const API_BASE_URL = 'http://127.0.0.1:10001/api/merchant-admin';

export interface ApiResponse<T = unknown> {
  code: string;
  info: string;
  data: T | null;
}

// 优惠券模板接口
export interface CouponTemplate {
  couponTemplateId: number;
  name: string;
  source: number;
  target: number;
  goods: string | null;
  type: number;
  validStartTime: string;
  validEndTime: string;
  stock: number;
  receiveRule: string;
  consumeRule: string;
  status: number;
}

// 分页查询参数接口
export interface QueryParams {
  pageNum: number;
  pageSize: number;
  name?: string;
  target?: number;
  goods?: string;
  type?: number;
}

// 分页查询响应接口
export interface PageResponse<T> {
  code: string;
  info: string;
  data: T[];
  total: number;
}

// 创建优惠券模板
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

// 分页查询优惠券模板
export const queryCouponTemplates = async (params: QueryParams): Promise<PageResponse<CouponTemplate>> => {
  // 构建查询参数
  const queryParams = new URLSearchParams();
  
  // 添加必需参数
  queryParams.append('pageNum', params.pageNum.toString());
  queryParams.append('pageSize', params.pageSize.toString());
  
  // 添加可选参数（只添加有值的参数）
  if (params.name) {
    queryParams.append('name', params.name);
  }
  if (params.target !== undefined && params.target !== null) {
    queryParams.append('target', params.target.toString());
  }
  if (params.goods) {
    queryParams.append('goods', params.goods);
  }
  if (params.type !== undefined && params.type !== null) {
    queryParams.append('type', params.type.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/coupon-template/page?${queryParams.toString()}`, 
    {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
