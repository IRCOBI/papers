<template>
  <div>
    <!-- MAIN PANEL SHOWING ALL PUBLICATIONS -->
    <HelpHome />
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <Messages :error="error" :message="message" />
      <h2>{{ subtitle }}</h2>
      <b-container v-for="(pub, index) in pubs" :key="index" class="mt-2 ps-0">
        <b-row no-gutters :class="'p-2 ' + (pub.owner ? 'pub-owner' : (pub.notowner ? 'pub-notowner' : (issuper ? 'pub-super' : 'pub-weird')))">
          <b-col sm="3">
            <b-button variant="outline-primary" :to="'/panel/' + pub.id" :data-cy="'panel-pub-' + pub.id">
              {{ pub.name }}
            </b-button>
          </b-col>
          <b-col :sm="pub.isowner || issuper ? 6 : 9">
            <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
            <br v-if="!pub.enabled" />
            {{ pub.description }}
          </b-col>
          <b-col v-if="pub.isowner || issuper" sm="3" class="text-end">
            <b-button variant="outline-primary" size="sm" class="me-2" :to="'/panel/' + pub.id + '/admin-setup#details'" :data-cy="'panel-edit-' + pub.id">
              Edit
            </b-button>
            <b-button variant="outline-primary" size="sm" class="me-2" @click="duplicatePub(pub)" :data-cy="'panel-dup-' + pub.id">
              Duplicate
            </b-button>
            <b-button variant="outline-danger" size="sm" @click="deletePub(pub)" :data-cy="'panel-delete-' + pub.id">
              Delete
            </b-button>
          </b-col>
        </b-row>
      </b-container>
      <div v-if="nowtavailable">
        Nothing available
      </div>
    </div>

    <b-modal v-model="showDuplicateModal" id="bv-modal-dup-pub" :title="'Duplicate ' + (duppub ? duppub.name : '')" centered>
      <template #default>
        <form @submit.stop.prevent>
          <ul>
            <li>
              This will copy the set up of this conference, but not its submissions.
            </li>
            <li>
              You can choose whether or not to give the current users access to the new conference - and copy their roles across.
              You will be an owner of the new conference either way.
            </li>
          </ul>
          <b-form-group label="Name" label-for="pubname" label-cols-sm="2" :state="true">
            <b-form-input id="pubname" v-model="pubname" placeholder="Required, eg IRCOBI Europe 2027" required></b-form-input>
          </b-form-group>
          <b-form-group label="Users" label-for="pubdupusers" label-cols-sm="2" :state="true">
            <b-form-checkbox id="pubdupusers" v-model="pubdupusers" class="mt-2">
              Give users access and copy roles
            </b-form-checkbox>
          </b-form-group>
        </form>
        <div class="text-center bg-warning m-2" v-if="showdupwait">Please wait...</div>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="showDuplicateModal = false"> Cancel </b-button>
        <b-button variant="primary" @click="okDupPub"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useSitePagesStore } from "~/stores/sitepages"
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const sitePagesStore = useSitePagesStore()
const runtimeConfig = useRuntimeConfig()
const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS)

const error = ref('')
const subtitle = ref('')

const message = computed(() => {
  return 'Hello ' + authStore.username
})

const fatalerror = computed(() => {
  return pubsStore.error
})

const issuper = computed(() => {
  return authStore.super
})

const pubs = computed(() => {
  const pubs = pubsStore.pubs

  // Set apiversion here
  for (const pub in pubs) {
    miscStore.set({ key: 'apiversion', value: pubs[pub].apiversion })
    break
  }

  return pubs
})

const nowtavailable = computed(() => {
  const pubs = pubsStore.pubs
  let count = 0
  for (const pub in pubs) { count++ }
  return count === 0
})

onMounted(async () => {
  let title = 'Publications'
  if ('publicsettings' in authStore && 'pubscalled' in authStore.publicsettings) {
    title = authStore.publicsettings.pubscalled
    subtitle.value = 'Your ' + title.toLowerCase()
  }
  miscStore.set({ key: 'page-title', value: title })
  await pubsStore.clearError()
  await pubsStore.fetch()
})

const showDuplicateModal = ref(false)
const duppub = ref<any>(null)
const pubname = ref('')
const pubdupusers = ref(true)
const showdupwait = ref(false)
const confirmpub = ref<any>(null)

function duplicatePub(pub: any) {
  duppub.value = pub
  pubname.value = ''
  pubdupusers.value = true
  showdupwait.value = false
  showDuplicateModal.value = true
}

async function okDupPub() {
  try {
    pubname.value = pubname.value.trim()
    if (pubname.value.length === 0) return msgBoxOk('Please give a name')

    showdupwait.value = true
    const ok = await api.pubs.duplicatePub(duppub.value.id, pubname.value, pubdupusers.value)
    showdupwait.value = false
    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        showDuplicateModal.value = false
        msgBoxOk('Duplicated as ' + pubname.value)
      })
    } else {
      msgBoxFail('Duplicate went wrong')
    }
  } catch (e: any) {
    showdupwait.value = false
    msgBoxError('Error duplicating: ' + e.message)
  }
}

function deletePub(pub: any) {
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to delete this? Only one with no submissions can be deleted.', confirmDeletePub, null, null, null, 'danger')
}

async function confirmDeletePub() {
  try {
    const ok = await api.pubs.deletePub(confirmpub.value.id)
    if (ok) {
      await pubsStore.fetch()
    } else {
      msgBoxFail('Delete went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error deleting: ' + e.message)
  }
}
</script>
