<script setup lang="ts">
import type {DepthItem} from "@/api/depth";

const props = defineProps({
  depths: {
    type: Array as () => DepthItem[],
    required: true,
  }
})

</script>

<template>
  <div class="bid-quote">
    <el-table
        :data="props.depths"
        :show-header="false"
        class="table-style"
    >
      <el-table-column fixed prop="price"/>
      <el-table-column fixed prop="amount"/>
      <template v-slot:empty>
        <div class="noData">暂无数据</div>
      </template>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.table-style {
  background-color: #2c3e50 !important;
}

.table-style ::v-deep .el-table th.el-table__cell,
::v-deep .el-table th,
::v-deep .el-table tr {
  color: white;
  background-color: #2c3e50 !important;
  font-size: 12px;
}

::v-deep .el-table__body .el-table__row.hover-row td {
  background-color: #1c2e40 !important;
}
</style>