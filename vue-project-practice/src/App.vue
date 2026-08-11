<script setup>
import { RouterLink, RouterView } from 'vue-router' //외부 컴포넌트
import HelloWorld from './components/HelloWorld.vue'
import SampleOne from './components/SampleOne.vue'
import SampleTwo from './components/SampleTwo.vue'
import VueHtml from './components/VueHtml.vue'
import VueHtmlXss from './components/VueHtmlXss.vue'
import VueText from './components/VueText.vue'
import VueBind from './components/VueBind.vue'
import VueBindClass from './components/VueBindClass.vue'
import VueBindStyle from './components/VueBindStyle.vue'
import VueBindShorthand from './components/VueBindShorthand.vue'
import VueIf from './components/VueIf.vue'
import VueFor from './components/VueFor.vue'
import VueShow from './components/VueShow.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="넌 할 수 있어!" />
      <SampleOne />
      <SampleTwo />

      <h1>2. Vue Directive</h1>
      <hr />

      <section class="directive-list">
        <VueHtml />
        <VueHtmlXss />
        <VueText />
        <VueBind />
        <VueBindClass />
        <VueBindStyle />
        <VueBindShorthand />
        <VueIf />
        <VueFor />
        <VueShow />
      </section>

      <hr />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  overflow-y: auto;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

h1 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem;
}

hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5rem 0;
}

.directive-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.directive-list > * {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>