// MES系统配置
export interface MesConfig {
  serverUrl: string;
  apiKey: string;
  factoryCode: string;
  lineCode: string;
  connectTimeout: number;
  requestTimeout: number;
  retries: number;
}

// MES工单信息
export interface MesWorkOrder {
  workOrderId: string;
  productModel: string;
  productVid: string;
  productPid: string;
  planQuantity: number;
  completedQuantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  startTime?: string;
  endTime?: string;
}

// 测试数据上传
export interface TestDataUpload {
  workOrderId: string;
  serialNumber: string;
  result: 'PASS' | 'FAIL';
  testItems: TestItemResult[];
  testTime: string;
  stationId: string;
  operatorId: string;
  deviceId: string;
  extraData?: Record<string, any>;
}

// 单个测试项目结果
export interface TestItemResult {
  itemCode: string;
  itemName: string;
  result: 'PASS' | 'FAIL' | 'SKIP';
  actualValue: number;
  standardValue: number;
  unit: string;
  deviation?: number;
  errorCode?: string;
  errorMessage?: string;
}

// MAC地址信息
export interface MacAddressInfo {
  mac: string;
  status: 'unused' | 'used' | 'burned';
  assignedTime?: string;
  usedForWorkOrder?: string;
}

// MES API响应
export interface MesApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  requestId?: string;
  timestamp: string;
}
