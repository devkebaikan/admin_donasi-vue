<template>
  <component :is="is ?? 'div'" :id="id"></component>
</template>

<script setup lang="ts">
import { Grid } from 'gridjs'
import { onMounted, watch } from 'vue'

type GridJsTablePropsType = {
  is?: string
  id: string
  options: object
}

const props = defineProps<GridJsTablePropsType>()

const renderGrid = () => {
  const ele = document.getElementById(props.id)
  if (ele) {
    ele.innerHTML = ''
    new Grid(props.options).render(ele)
  }
}

onMounted(() => {
  renderGrid()
})

watch(
  () => props.options,
  () => {
    renderGrid()
  },
  { deep: true }
)
</script>
