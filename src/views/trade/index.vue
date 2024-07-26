<script setup lang="ts">
import Cookies from 'js-cookie'
import {onMounted} from "vue";
import HeaderView from '@/views/trade/header/index.vue'
import MainView from '@/views/trade/main/index.vue'
import FooterView from '@/views/trade/footer/index.vue'
import {createGuest} from "@/api/user";
import {instance} from "@/singleton/wsClient";

import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()

onMounted(() => {
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
      }
    })
  } else {
    instance.connect(topics)
  }
})

</script>

<template>
  <div class="trade-container">
    <div class="header-container">
      <HeaderView/>
    </div>
    <div class="main-container">
      <MainView/>
    </div>
    <div class="footer-container">
      <FooterView/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trade-container {
  width: 1800px;
  display: flex;
  flex-direction: column; /* 垂直方向布局 */
  justify-content: center; /* 子元素垂直居中 */
}

.header-container {
  width: 1800px;
  height: 50px;
  background-color: #2c3e50;
  //display: flex;
  //flex-direction: column; /* 垂直方向布局 */
  //justify-content: center; /* 子元素垂直居中 */
}

.main-container {
  width: 1800px;
  height: 800px;
  background-color: #2c3e50;
  //display: flex;
  //justify-content: center; /* 子元素水平居中 */
}

.footer-container {
  width: 1800px;
  background-color: #2c3e50;
  //display: flex;
  //flex-direction: column; /* 垂直方向布局 */
  //justify-content: center; /* 子元素垂直居中 */
}
</style>