<script setup lang="ts">
import { RouterView } from 'vue-router'
import MobileNav from '@/components/MobileNav.vue'
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式布局
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 添加主题类到body
  document.body.classList.add('binance-theme')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="app-container" :class="{ 'mobile-app': isMobile }">
    <main class="app-content">
      <RouterView />
    </main>
    
    <MobileNav v-if="isMobile" />
  </div>
</template>

<style>
@import '@/assets/theme.scss';

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<style scoped lang="scss">
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--binance-bg-base);
  
  &.mobile-app {
    padding-bottom: 60px; /* 为移动底部导航留出空间 */
  }
}

.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--binance-spacing-lg);
  background-color: var(--binance-bg-base);
  border-bottom: 1px solid var(--binance-border-base);
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 0 var(--binance-spacing-md);
  }
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--binance-primary);
  display: flex;
  align-items: center;
  
  .header-slogan {
    font-size: 12px;
    font-weight: normal;
    color: #f00;
    margin-left: 5px;
  }
}

.header-center {
  display: flex;
  flex: 1;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.header-nav {
  display: flex;
  gap: 32px;
  
  .nav-item {
    font-size: 16px;
    color: var(--binance-text-secondary);
    cursor: pointer;
    padding: 6px 0;
    position: relative;
    
    &:hover {
      color: var(--binance-text-primary);
    }
    
    &.active {
      color: var(--binance-text-primary);
      font-weight: 500;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--binance-primary);
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--binance-spacing-md);
  
  .user-info {
    font-size: 14px;
    color: var(--binance-text-secondary);
    cursor: pointer;
    
    &:hover {
      color: var(--binance-primary);
    }
  }
}

.app-content {
  flex: 1;
  padding: 0;
  background-color: var(--binance-bg-base);
  
  @media (max-width: 768px) {
    padding: 0;
  }
}
</style>
