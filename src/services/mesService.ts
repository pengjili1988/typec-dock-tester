import { useMesStore } from '@/stores/mesStore';
import type { MesConfig, MesWorkOrder, TestDataUpload, MacAddressInfo } from '@/types/mes';

// MES服务
class MesService {
  private mesStore = useMesStore();

  /**
   * 初始化MES配置
   */
  async initialize(config: MesConfig): Promise<void> {
    this.mesStore.setConfig(config);
    localStorage.setItem('mesConfig', JSON.stringify(config));
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    const config = this.mesStore.config;
    if (!config) {
      throw new Error('MES配置未初始化');
    }

    this.mesStore.setConnectionStatus('connecting');

    try {
      // 模拟连接测试
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际实现应该通过Tauri命令调用后端API
      // const response = await invoke<string>('mes_http_request', {...});
      
      this.mesStore.setConnectionStatus('connected');
      return true;
    } catch (error) {
      this.mesStore.setConnectionStatus('error');
      throw error;
    }
  }

  /**
   * 获取工单列表
   */
  async getWorkOrders(_params?: {
    status?: string;
    productModel?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: MesWorkOrder[]; total: number }> {
    // 模拟数据
    const mockOrders: MesWorkOrder[] = [
      {
        workOrderId: 'WO-2024-001',
        productModel: 'USBC-001',
        productVid: '0x1234',
        productPid: '0x5678',
        planQuantity: 100,
        completedQuantity: 45,
        status: 'in_progress',
        startTime: '2024-01-15T08:00:00Z',
      },
      {
        workOrderId: 'WO-2024-002',
        productModel: 'HUB-002',
        productVid: '0x1234',
        productPid: '0x5679',
        planQuantity: 200,
        completedQuantity: 0,
        status: 'pending',
      },
    ];

    return {
      list: mockOrders,
      total: mockOrders.length,
    };
  }

  /**
   * 获取当前工单
   */
  async getCurrentWorkOrder(): Promise<MesWorkOrder | null> {
    const orders = await this.getWorkOrders({ status: 'in_progress' });
    return orders.list[0] || null;
  }

  /**
   * 上传测试数据
   */
  async uploadTestData(_data: TestDataUpload): Promise<boolean> {
    try {
      // 模拟上传
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.mesStore.setLastSyncTime(new Date());
      return true;
    } catch (error) {
      this.mesStore.setLastSyncError(String(error));
      throw error;
    }
  }

  /**
   * 获取MAC地址
   */
  async allocateMacAddress(_workOrderId: string): Promise<MacAddressInfo | null> {
    // 模拟分配MAC地址
    const mac = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');

    return {
      mac,
      status: 'unused',
    };
  }

  /**
   * 上报MAC烧录结果
   */
  async reportMacBurnResult(
    _mac: string,
    _result: 'SUCCESS' | 'FAIL',
    _errorMessage?: string
  ): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 验证序列号
   */
  async verifySerialNumber(sn: string): Promise<{
    valid: boolean;
    productModel?: string;
    workOrderId?: string;
  }> {
    // 模拟验证
    return {
      valid: sn.length > 0,
      productModel: 'USBC-001',
      workOrderId: 'WO-2024-001',
    };
  }
}

export const mesService = new MesService();
