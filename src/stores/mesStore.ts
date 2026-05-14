import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MesConfig, MesWorkOrder } from '@/types/mes';

export const useMesStore = defineStore('mes', () => {
  // 状态
  const connected = ref(false);
  const connecting = ref(false);
  const currentOrder = ref<MesWorkOrder | null>(null);
  const orderList = ref<MesWorkOrder[]>([]);
  const lastSyncTime = ref<Date | null>(null);
  const lastSyncError = ref<string | null>(null);
  const config = ref<MesConfig | null>(null);

  // Actions
  const setConnectionStatus = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
    connected.value = status === 'connected';
    connecting.value = status === 'connecting';
    if (status === 'disconnected') {
      lastSyncError.value = null;
    }
  };

  const setCurrentOrder = (order: MesWorkOrder | null) => {
    currentOrder.value = order;
  };

  const setOrderList = (orders: MesWorkOrder[]) => {
    orderList.value = orders;
  };

  const setLastSyncTime = (time: Date) => {
    lastSyncTime.value = time;
    lastSyncError.value = null;
  };

  const setLastSyncError = (error: string) => {
    lastSyncError.value = error;
  };

  const setConfig = (cfg: MesConfig | null) => {
    config.value = cfg;
    if (cfg) {
      localStorage.setItem('mesConfig', JSON.stringify(cfg));
    }
  };

  const loadConfig = () => {
    const saved = localStorage.getItem('mesConfig');
    if (saved) {
      try {
        config.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse MES config:', e);
      }
    }
  };

  return {
    // 状态
    connected,
    connecting,
    currentOrder,
    orderList,
    lastSyncTime,
    lastSyncError,
    config,
    // Actions
    setConnectionStatus,
    setCurrentOrder,
    setOrderList,
    setLastSyncTime,
    setLastSyncError,
    setConfig,
    loadConfig,
  };
});
