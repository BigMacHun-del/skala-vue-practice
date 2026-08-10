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
      <VueHtml />
      <VueHtmlXss />
      <VueText />
      <VueBind />
      <VueBindClass />
      <VueBindStyle />
      <VueBindShorthand />

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
}

.logo {
  display: block;
  margin: 0 auto 2rem;
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
