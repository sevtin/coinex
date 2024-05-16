<script setup lang="ts">

import {computed, PropType} from "vue";
import type {IMenu} from "@/components/menu/menu"

const props = defineProps({
  menu: {
    type: Object as PropType<IMenu>,
    required: true
  }
})

const color = computed(() => {
  if (props.menu?.Selected) {
    return props.menu.SelectedColor
  }
  if (props.menu?.Entered) {
    return props.menu.SelectedColor
  }
  return props.menu?.Color
})

const fontSize = computed(() => {
  return props.menu?.FontSize
})

</script>

<template>
  <div class="menu-class">
    <div class="text-class" :style="{color: color,fontSize:fontSize}">
      {{ props.menu.Text }}
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
