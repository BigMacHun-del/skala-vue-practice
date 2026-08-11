<script setup>
// 1. Reactive State
import ReactiveRef from './components/composition/ReactiveRef.vue'
import ReactiveReactive from './components/composition/ReactiveReactive.vue'
// 2. Computed / Watchers
import ComputedBasic from './components/composition/ComputedBasic.vue'
import WatchersBasic from './components/composition/WatchersBasic.vue'
import WatchersMulti from './components/composition/WatchersMulti.vue'
import WatchersDeep from './components/composition/WatchersDeep.vue'
import WatchersReactive from './components/composition/WatchersReactive.vue'
import WatchersRefArray from './components/composition/WatchersRefArray.vue'
import WatchersReactiveArray from './components/composition/WatchersReactiveArray.vue'
import WatchersWatchEffect from './components/composition/WatchersWatchEffect.vue'

</script>

<template>
  <div class="practice-container">
    <h1>1. Reactive State</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />
    <h1>2. Computed & Watchers</h1>
    <hr />
    <ComputedBasic />
    <WatchersBasic />
    <WatchersMulti />
    <WatchersDeep />
    <WatchersReactive />
    <WatchersRefArray />
    <WatchersReactiveArray />
    <WatchersWatchEffect />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
