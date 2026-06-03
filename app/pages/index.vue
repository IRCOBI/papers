<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-if="sitePagesStore.error" class="alert alert-warning">
      <strong>Content Loading Issue:</strong> {{ sitePagesStore.error }}
      <div class="mt-2 small">
        Please check the browser console for more details.
      </div>
    </div>
    <div v-else-if="!content && !loading" class="alert alert-info">
      No home page content found. Please configure a site page with path "/" in the
      <a href="/admin/site-pages">admin panel</a>.
    </div>
    <div v-else v-html="content" data-cy="index-sitepages-content">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMiscStore } from "~/stores/misc"
import { useSitePagesStore } from "~/stores/sitepages"

const error = ref('')
const message = ref('')
const loading = ref(true)

const sitePagesStore = useSitePagesStore()
const miscStore = useMiscStore()

const content = computed(() => {
  const sitepage = sitePagesStore.get('/')
  if (sitepage) {
    miscStore.set({ key: 'page-title', value: sitepage.title })
  }
  return sitepage ? sitepage.content : ''
})

onMounted(async () => {
  console.log('Home page mounted - fetching site pages')
  await sitePagesStore.fetch()
  loading.value = false
  console.log('Site pages loaded, list:', sitePagesStore.list)
  console.log('Home page content:', sitePagesStore.get('/'))
})
</script>
