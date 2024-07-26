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
    <div class="radio-group-view">
      <el-radio-group v-model="selectedInterval" @change="intervalHandler" style="margin-bottom: 30px">
        <el-radio-button v-for="interval in intervals" :key="interval.intvl" :value="interval.intvl">{{
            interval.name
          }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="chart-view">
      <ChartView/>
    </div>
  </div>
</template>

<style scoped>

.kline-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.radio-group-view {
  height: 40px;
  display: flex;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 4px;
}

.chart-view {
  width: 100%;
}

::v-deep .el-radio-button__inner {
  color: #333;
}

::v-deep .el-radio-button__inner.v-model:checked::v-deep .el-radio-button__inner {
  background-color: #333;
  color: #000;
}
</style>