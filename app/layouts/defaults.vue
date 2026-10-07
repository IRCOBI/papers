<template>
  <div>
    <Html>

    <Head>
      <Title>{{ title }}</Title>
    </Head>

    </Html>
    <div :class="'container' + (issuper ? ' header-super' : ismasquerading ? ' header-masquerading' : '')">
      <div class="border border-primary rounded p-3">
        <div class="float-end">
          <div v-if="loggedin">
            <b-button to="/admin" v-if="issuper" variant="outline-danger" class="me-2">Super</b-button>
            <b-button to="/account" variant="outline-secondary" class="me-2">{{ username }}</b-button>
            <b-button @click="logout()" variant="outline-secondary" class="me-2" title="Logout">
              <v-icon icon="sign-out-alt" />
            </b-button>
          </div>
          <div v-else>
            <b-button variant="outline-success" to="/login" class="me-2">Login</b-button>
            <b-button variant="outline-secondary" to="/register" class="me-2">Register</b-button>
          </div>
        </div>
        <b-button variant="outline-secondary" class="me-2" to="/" v-if="!loggedin" title="Home">
          <v-icon icon="home" />
        </b-button>
        <b-button variant="outline-secondary" class="me-2" to="/panel" v-if="loggedin" title="Control Panel">
          <v-icon icon="home" />
        </b-button>
        <h1 class="menu-title" data-cy="layout-h1">
          <nuxt-link v-if="pubid" :to="'/panel/' + pubid" data-cy="layout-h1-a">{{ title }}</nuxt-link>
          <span v-else>
            {{ title }}
          </span>
          {{ titlesuffix }}
        </h1>
      </div>
    </div>
    <div class="container">
      <b-alert v-if="loggedin && mailproblem" variant="danger" :modelValue="true" class="mt-2" data-cy="layout-mailproblem">
        <strong>Emails are not being sent.</strong> {{ mailproblem.problem }}
        (since {{ new Date(mailproblem.since).toLocaleString() }}).
        Authors, reviewers and the secretariat copy are not receiving notifications - please contact your system administrator.
      </b-alert>
      <b-alert variant="warning" :modelValue="getlayoutmessage.length > 0" class="mt-2">
        {{ getlayoutmessage }}
      </b-alert>
      <slot />
    </div>
    <div class="container mt-3 pt-2 border-top" style="color: gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{ apiversion }}</a>,
      <span style="color: lightgrey"> built: {{ BUILD_DATE }}. Copyright &copy; 2025 PHD Computer Consultants Ltd. </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener">
        Get in touch if you want to try out Papers for your conference or journal.
      </a>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const usersStore = useUsersStore()

const layoutmessage = ref('')
const getlayoutmessage = computed(() => {
  const startmessage = miscStore.get('message')
  return startmessage ?? ''
})

const loggedin = computed(() => {
  return authStore.loggedin
})
const mailproblem = computed(() => {
  return pubsStore.mailproblem
})

const issuper = computed(() => {
  return authStore.super
})
const ismasquerading = computed(() => {
  return authStore.masquerading
})
const pubid = computed(() => {
  const route = useRoute()
  // const path = '/' + route.params.id
  if ('pubid' in route.params) {
    return parseInt(route.params.pubid)
  }
  else
    return false
})
const title = computed(() => {
  return miscStore.get('page-title')
})
const titlesuffix = computed(() => {
  return miscStore.get('page-title-suffix')
})

//const yourtime = computed(() => {
//  const now = new Date()
//  return now.toLocaleString()
//})
const version = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.VERSION
})
const BUILD_DATE = computed(() => {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.BUILD_DATE
})
const apiversion = computed(() => {
  return miscStore.get('apiversion')
})
const username = computed(() => {
  return authStore.name
})

async function logout() {
  await authStore.logout()
  miscStore.clearAll()
  pubsStore.clearAll()
  submitsStore.clearAll()
  usersStore.clearAll()
  navigateTo('/')
}

const nuxtApp = useNuxtApp()

// provide $setLayoutMessage on nuxtApp for all pages and components if they wish to...
// Set stored message for next page
nuxtApp.provide('setLayoutMessage', (msg) => {
  layoutmessage.value = msg
  console.log('setLayoutMessage', layoutmessage.value)
})

// On page navigate, set message for next page and clear stored message
const unregisterNavigationGuard = useRouter().beforeEach((to, from, next) => {
  miscStore.set({ key: 'message', value: layoutmessage.value })
  layoutmessage.value = false
  next()
})

onUnmounted(unregisterNavigationGuard)

</script>


<style>
.menu-title {
  font-size: 1.5rem;
  font-weight: bold;
  display: inline;
  /*white-space: nowrap;*/
}
</style>
