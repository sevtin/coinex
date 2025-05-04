<script setup lang="ts">
import type {Balance} from "@/api/balance";
import {ref, watch, computed, onMounted} from "vue";
import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()
const userBalances = computed(() => operationStore.Balances);

const balances = ref<Balance[]>([]);
const activeDropdown = ref('');
const isMobile = ref(window.innerWidth < 768);

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 处理下拉菜单显示
const toggleDropdown = (menu: string) => {
  if (activeDropdown.value === menu) {
    activeDropdown.value = '';
  } else {
    activeDropdown.value = menu;
  }
};

// 点击其他区域关闭下拉菜单
const closeDropdown = () => {
  activeDropdown.value = '';
};

watch(
    userBalances,
    (newBalances) => {
      balances.value = newBalances;
    }
);
</script>

<template>
  <div class="header-container" @click.self="closeDropdown">
    <div class="header-left">
      <div class="logo-container">
        <img src="@/assets/eipi-star.png" alt="Logo" class="logo" />
        <div class="brand-name" v-if="!isMobile">eipistar exchange</div>
      </div>
      
      <div class="nav-links" v-if="!isMobile">
        <div class="nav-item active">现货</div>
        <div class="nav-item">合约</div>
        <div class="nav-item">衍生品</div>
      </div>
    </div>
    
    <div class="header-right">
      <div class="wallet-container" @click.stop="toggleDropdown('wallet')">
        <svg class="modern-icon wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"></path>
          <path d="M18 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z"></path>
          <path d="M2 10h20"></path>
        </svg>
        <span v-if="!isMobile">钱包</span>
        <div class="dropdown-menu" v-if="activeDropdown === 'wallet'">
          <div class="dropdown-header">我的资产</div>
          <div class="balances-list">
            <div v-for="item in balances" :key="item.cur_id" class="balance-item">
              <span class="currency-name">{{ item.cur_name }}</span>
              <span class="currency-balance">{{ item.balance }}</span>
            </div>
            <div v-if="balances.length === 0" class="empty-balance">
              暂无资产数据
            </div>
          </div>
          <div class="dropdown-footer">
            <!--<button class="action-button">充值</button>-->
            <!--<button class="action-button">提现</button>-->
          </div>
        </div>
      </div>
      
      <div class="user-menu" @click.stop="toggleDropdown('user')">
        <svg class="modern-icon user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 20a6 6 0 0 0-12 0"></path>
          <circle cx="12" cy="10" r="4"></circle>
        </svg>
        <div class="dropdown-menu user-dropdown" v-if="activeDropdown === 'user'">
          <div class="dropdown-item">个人中心</div>
          <div class="dropdown-item">安全设置</div>
          <div class="dropdown-item">API管理</div>
          <div class="dropdown-item">退出登录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--binance-spacing-md);
  position: relative;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--binance-spacing-xl);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--binance-spacing-sm);
}

.logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--binance-text-primary);
}

.nav-links {
  display: flex;
  gap: var(--binance-spacing-lg);
}

.nav-item {
  font-size: 15px;
  color: var(--binance-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--binance-border-radius-sm);
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--binance-primary);
    background-color: var(--binance-bg-tertiary);
  }
  
  &.active {
    color: var(--binance-primary);
    font-weight: 500;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--binance-spacing-md);
}

.wallet-container, .user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--binance-spacing-xs);
  padding: 6px 12px;
  border-radius: var(--binance-border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--binance-text-secondary);
  
  &:hover {
    background-color: var(--binance-bg-tertiary);
    color: var(--binance-primary);
  }
}

.modern-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.wallet-icon, .user-icon {
  opacity: 0.8;
  
  .wallet-container:hover &,
  .user-menu:hover & {
    opacity: 1;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  margin-top: 8px;
  background-color: var(--binance-bg-card);
  border-radius: var(--binance-border-radius-md);
  box-shadow: var(--binance-shadow);
  z-index: 100;
  border: 1px solid var(--binance-border-base);
  
  &.user-dropdown {
    width: 180px;
  }
}

.dropdown-header {
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--binance-border-base);
  color: var(--binance-text-primary);
}

.balances-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--binance-bg-tertiary);
  }
  
  .currency-name {
    font-weight: 500;
    color: var(--binance-text-primary);
  }
  
  .currency-balance {
    color: var(--binance-text-secondary);
  }
}

.empty-balance {
  padding: 16px;
  text-align: center;
  color: var(--binance-text-tertiary);
  font-style: italic;
}

.dropdown-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--binance-border-base);
}

.action-button {
  padding: 6px 12px;
  background-color: var(--binance-bg-tertiary);
  border: none;
  border-radius: var(--binance-border-radius-sm);
  color: var(--binance-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--binance-primary);
    color: #fff;
  }
}

.dropdown-item {
  padding: 10px 16px;
  color: var(--binance-text-secondary);
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--binance-bg-tertiary);
    color: var(--binance-text-primary);
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--binance-spacing-sm);
  }
  
  .dropdown-menu {
    width: 280px;
    right: -10px;
  }
}
</style>