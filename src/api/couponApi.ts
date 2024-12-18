import { CouponState } from '../types/coupon';

const API_BASE_URL = 'http://127.0.0.1:10001/api/merchant-admin';

export interface ApiResponse<T = unknown> {
  code: string;
  info: string;
  data: T | null;
}

// 优惠券模板接口
export interface CouponTemplate {
  couponTemplateId: bigint;
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

// 查询优惠券详情
export const queryCouponTemplateDetail = async (couponTemplateId: bigint): Promise<ApiResponse<CouponTemplate>> => {
  const response = await fetch(
    `${API_BASE_URL}/coupon-template/query?couponTemplateId=${couponTemplateId.toString()}`,
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

// 结束优惠券模板
export const terminateCouponTemplate = async (couponTemplateId: bigint): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/coupon-template/terminate?couponTemplateId=${couponTemplateId.toString()}`,
    {
      method: 'POST',
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

// 增加优惠券库存
export const increaseCouponStock = async (couponTemplateId: bigint, stock: number): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/coupon-template/increase-stock?couponTemplateId=${couponTemplateId.toString()}&stock=${stock}`,
    {
      method: 'POST',
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

// 下载优惠券模板文件
export const downloadTemplateFile = async (rowNum: number): Promise<Blob> => {
  const response = await fetch(
    `${API_BASE_URL}/coupon-task/download-template-file?rowNum=${rowNum}`,
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

  return await response.blob();
};

// 创建分发任务
export const createCouponTask = async (
  taskName: string,
  notifyType: string,
  couponTemplateId: bigint,
  sendType: string,
  sendTime: string | null,
  file: File
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('taskName', taskName);
  formData.append('notifyType', notifyType);
  formData.append('couponTemplateId', couponTemplateId.toString());
  formData.append('sendType', sendType);
  if (sendTime) {
    formData.append('sendTime', sendTime);
  }
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/coupon-task/create`,
    {
      method: 'POST',
      headers: {
        'Accept': '*/*',
      },
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
