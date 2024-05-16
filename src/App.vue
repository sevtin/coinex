<script setup lang="ts">
import {RouterView} from 'vue-router'
</script>

<template>
  <div class="app-container">
    <router-view/>
  </div>
</template>

<style scoped lang="scss">
//*{
//  margin:0;
//  padding:0;
//  border:0;
//}
.app-container {
  background-color: #2c3e50;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
