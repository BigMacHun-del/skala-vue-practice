<script setup>
import { RouterLink, RouterView } from 'vue-router' //외부 컴포넌트
import HelloWorld from './components/practice/HelloWorld.vue/index.js'
import SampleOne from './components/practice/SampleOne.vue/index.js'
import SampleTwo from './components/practice/SampleTwo.vue/index.js'
import VueHtml from './components/practice/VueHtml.vue/index.js'
import VueHtmlXss from './components/practice/VueHtmlXss.vue/index.js'
import VueText from './components/practice/VueText.vue/index.js'
import VueBind from './components/practice/VueBind.vue/index.js'
import VueBindClass from './components/practice/VueBindClass.vue/index.js'
import VueBindStyle from './components/practice/VueBindStyle.vue/index.js'
import VueBindShorthand from './components/practice/VueBindShorthand.vue/index.js'
import VueIf from './components/practice/VueIf.vue/index.js'
import VueFor from './components/practice/VueFor.vue/index.js'
import VueShow from './components/practice/VueShow.vue/index.js'
import VuePre from './components/practice/VuePre.vue/index.js'
import VueCloak from './components/practice/VueCloak.vue/index.js'
import VueOnce from './components/practice/VueOnce.vue/index.js'
import VueMemo from './components/practice/VueMemo.vue/index.js'
import EventBasic from './components/practice/EventBasic.vue/index.js'
import EventObject from './components/practice/EventObject.vue/index.js'
import EventModifier from './components/practice/EventModifier.vue/index.js'
import ModelBasic from './components/practice/ModelBasic.vue/index.js'
import ModelForm from './components/practice/ModelForm.vue/index.js'
import ModelModifier from './components/practice/ModelModifier.vue/index.js'
import VueScoped from './components/practice/VueScoped.vue/index.js'

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
        <VuePre />
        <VueCloak />
        <VueOnce />
        <VueMemo />
      </section>

      <hr />

      <h1>3. Vue Event</h1>
      <hr>
      <section class="directive-list">
        <EventBasic />
        <EventObject />
        <EventModifier />
      </section>
      <hr />

      <h1>4. Vue Model & Vue Style</h1>
      <hr>
      <section class="directive-list">
        <ModelBasic />
        <ModelForm />
        <ModelModifier />
        <VueScoped />

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