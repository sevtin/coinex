<script setup lang="ts">
import Cookies from 'js-cookie'
import {onMounted, ref} from "vue";
import HeaderView from '@/views/trade/header/index.vue'
import MainView from '@/views/trade/main/index.vue'
import FooterView from '@/views/trade/footer/index.vue'
import {createGuest} from "@/api/user";
import {instance} from "@/singleton/wsClient";
import MobileNav from '@/components/MobileNav.vue'

import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  operationStore.setMarket(1440);
  operationStore.setTicker(1, 'BTCUSDT', 1440, 0, 0);
  operationStore.setDepth(10);
  operationStore.setKlineIntvl(1);

  let token = Cookies.get('token') as string
  let topics = ["MARKET@1440", "BTCUSDT@TICKER_1440", "BTCUSDT@KLINE_1", "BTCUSDT@DEPTH_10", "BTCUSDT@TRADE"]
  if (!token) {
    createGuest().then((resp) => {
      if (resp.code == 0) {
        instance.connect(topics)
        setTimeout(() => {
          operationStore.updateBalances()
        }, 1000);
      }
    })
  } else {
    instance.connect(topics)
    operationStore.updateBalances()
  }
})

</script>

<template>
  <div class="trade-container container">
    <div class="header-container">
      <HeaderView/>
    </div>
    <div class="main-container">
      <MainView/>
    </div>
    <div class="footer-container" :class="{'mobile-footer': isMobile}">
      <FooterView/>
    </div>
    <MobileNav v-if="isMobile" />
  </div>
</template>

<style scoped lang="scss">
.trade-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--binance-bg-base);
}

.header-container {
  width: 100%;
  height: 64px;
  background-color: var(--binance-bg-secondary);
  border-bottom: 1px solid var(--binance-border-base);
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-container {
  width: 100%;
  min-height: calc(100vh - 64px - 300px);
  background-color: var(--binance-bg-base);
  padding: var(--binance-spacing-md);
  
  @media (max-width: 768px) {
    padding: var(--binance-spacing-sm);
    min-height: calc(100vh - 64px - 200px - 60px); // 减去header、footer和移动导航高度
  }
}

.footer-container {
  width: 100%;
  min-height: 300px;
  background-color: var(--binance-bg-secondary);
  border-top: 1px solid var(--binance-border-base);
  
  &.mobile-footer {
    min-height: 200px;
    margin-bottom: 60px; // 为移动端导航留出空间
  }
}
</style>