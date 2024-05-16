<script setup lang="ts">
import CurrentOrderView from "@/views/trade/footer/components/currentOrder.vue"
import HistoricalOrderView from "@/views/trade/footer/components/historicalOrder.vue"
import type {TabsPaneContext} from 'element-plus'
import {ref} from "vue";

var curTab: string
const currentRef = ref(null);
const historyRef = ref(null);
const activeName = ref('current')

const onTabsClick = (tab: TabsPaneContext, _: Event) => {
  if (curTab === tab.props.name) {
    return
  }
  curTab = tab.props.name as string
  switch (curTab) {
    case "current":
      currentRef.value.loadOrderList();
      break
    case "history":
      historyRef.value.loadOrderList();
      break
  }
}

</script>

<template>
  <div class="footer-container">
    <el-tabs v-model="activeName"  @tab-click="onTabsClick">
      <el-tab-pane class="current-order-view" label="当前委托" name="current">
        <CurrentOrderView ref="currentRef" :history="false"/>
      </el-tab-pane>
      <el-tab-pane class="historical-order-view" label="历史委托" name="history">
        <HistoricalOrderView ref="historyRef" :history="true"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.footer-container {
  width: 100%;
  min-height: 200px;
}

.current-order-view {
  width: 100%;
  min-height: 200px;
}

.historical-order-view {
  width: 100%;
  min-height: 200px;
}

::v-deep .el-tabs__item.is-active {
  color: white;
}

::v-deep .el-tabs__item {
  color: #666;
}

::v-deep .el-tabs__nav .el-tabs__active-bar {
  background-color: #666;
}
</style>
