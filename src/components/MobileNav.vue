<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = computed(() => {
  const path = route.path;
  if (path.includes('/trade')) return 'trade';
  if (path.includes('/market')) return 'market';
  if (path.includes('/assets')) return 'assets';
  if (path.includes('/profile')) return 'profile';
  return 'home';
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="mobile-nav">
    <div class="nav-item" 
         :class="{ active: activeTab === 'home' }" 
         @click="navigateTo('/')">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
      </svg>
      <span class="nav-text">首页</span>
    </div>
    
    <div class="nav-item" 
         :class="{ active: activeTab === 'market' }" 
         @click="navigateTo('/market')">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
      </svg>
      <span class="nav-text">行情</span>
    </div>
    
    <div class="nav-item" 
         :class="{ active: activeTab === 'trade' }" 
         @click="navigateTo('/trade')">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M4 18h16v-2H4v2zM4 6v2h16V6H4zm0 7h16v-2H4v2z" />
      </svg>
      <span class="nav-text">交易</span>
    </div>
    
    <div class="nav-item" 
         :class="{ active: activeTab === 'assets' }" 
         @click="navigateTo('/assets')">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
      <span class="nav-text">资产</span>
    </div>
    
    <div class="nav-item" 
         :class="{ active: activeTab === 'profile' }" 
         @click="navigateTo('/profile')">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span class="nav-text">我的</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: var(--binance-bg-card);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top: 1px solid var(--binance-border-base);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 20%;
  height: 100%;
  color: var(--binance-text-secondary);
  transition: all 0.2s ease;
  padding: 6px 0;
  
  &.active {
    color: var(--binance-primary);
    
    .nav-icon {
      fill: var(--binance-primary);
    }
  }
  
  &:active {
    background-color: var(--binance-bg-tertiary);
  }
}

.nav-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 4px;
  fill: var(--binance-text-secondary);
  transition: all 0.2s ease;
}

.nav-text {
  font-size: 11px;
  font-weight: 500;
}
</style> 