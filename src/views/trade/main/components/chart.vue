<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from "vue";
import ChartView from '@/views/trade/main/components/chart/chart.vue'
import {instance} from "@/singleton/wsClient";
import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()
const selectedInterval = ref<Number>(1)
var oldIntvl = 1;
var connectSrv = false;
const intervals = [
  {name: '1分钟', intvl: 1},
  {name: '5分钟', intvl: 5},
  {name: '10分钟', intvl: 10},
  {name: '30分钟', intvl: 30},
  {name: '1小时', intvl: 60},
  {name: '2小时', intvl: 120},
  {name: '4小时', intvl: 240},
  {name: '12小时', intvl: 720},
  {name: '1天', intvl: 1440},
  {name: '1周', intvl: 10080},
  {name: '1月', intvl: 43200}
]

const intervalHandler = ((intvl: any) => {
  if (intvl === oldIntvl) {
    return
  }
  let symbol = operationStore.getTicker.symbol;
  let oldTopic = symbol + "@KLINE_" + oldIntvl.toString()
  let newTopic = symbol + "@KLINE_" + intvl
  oldIntvl = intvl
  operationStore.setKlineIntvl(intvl)
  instance.updateUnSubscribe(oldTopic, newTopic)
})

const judgeVisibility = (() => {
  if (document.visibilityState === 'visible') {
    // 当页面重新获得焦点，即从后台切换回前台时执行的操作
    console.log('Page is visible again. Call your query API here.', new Date());
    if (connectSrv) {
      connectSrv = false
      instance.reconnect();
    }
  } else {
    // 当页面失去焦点，即切换到后台时可能执行的操作
    instance.close();
    connectSrv = true
    console.log('Page is now in background.', new Date());
  }
})

onMounted(() => {
  document.addEventListener('visibilitychange', judgeVisibility);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', judgeVisibility);
});

</script>

<template>
  <div class="kline-container">
    <div class="time-interval-selector">
      <div class="interval-options">
        <div 
          v-for="interval in intervals" 
          :key="interval.intvl" 
          :class="['interval-item', selectedInterval === interval.intvl ? 'active' : '']"
          @click="selectedInterval = interval.intvl; intervalHandler(interval.intvl)">
          {{ interval.name }}
        </div>
      </div>
    </div>
    <div class="chart-view-container">
      <ChartView/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.kline-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e2026;
}

.time-interval-selector {
  height: 36px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #1e2026;
  
  .interval-options {
    display: flex;
    align-items: center;
    overflow-x: auto;
    padding: 0 8px;
    height: 100%;
    
    /* 隐藏水平滚动条 */
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
  }
  
  .interval-item {
    font-size: 12px;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 12px;
    white-space: nowrap;
    color: #848e9c;
    cursor: pointer;
    position: relative;
    transition: color 0.2s ease;
    
    &:hover {
      color: #eaecef;
    }
    
    &.active {
      color: #f0b90b;
      font-weight: 500;
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 12px;
        right: 12px;
        height: 2px;
        background-color: #f0b90b;
        border-radius: 2px 2px 0 0;
      }
    }
  }
}

.chart-view-container {
  flex: 1;
  min-height: 300px;
  position: relative;
  background-color: #1e2026;
}
</style>