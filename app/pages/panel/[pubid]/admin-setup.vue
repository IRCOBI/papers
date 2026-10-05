<template>
  <div>
    <!-- ADMIN SETUP PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminSetup />
      <Messages :error="error" :message="message" />
      <div class="mb-2">
        <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
      </div>
      <div>
        <b-button variant="outline-warning" @click="togglePubEnable(pub)">
          {{ pub.enabled ? 'DISABLE' : 'ENABLE' }}
        </b-button>
        <b-button variant="outline-primary" @click="duplicatePub" class="ms-2">
          Duplicate
        </b-button>
        <b-button variant="outline-danger" @click="deletePub(pub)" class="float-end">
          DELETE
        </b-button>
      </div>
      <div id="details" class="mt-4">
        <h3>Name and description</h3>
        <p class="text-muted mb-2">Shown in the list of conferences.</p>
        <b-form-group label="Name" label-for="editname" label-cols-sm="2">
          <b-form-input id="editname" v-model="editname" maxlength="50" data-cy="setup-editname" />
        </b-form-group>
        <b-form-group label="Description" label-for="editdescription" label-cols-sm="2">
          <b-form-textarea id="editdescription" v-model="editdescription" rows="2" data-cy="setup-editdescription" />
        </b-form-group>
        <b-button variant="primary" @click="saveDetails" :disabled="savingdetails" data-cy="setup-savedetails">
          {{ savingdetails ? 'Saving…' : 'Save' }}
        </b-button>
      </div>
    </div>

    <b-modal v-model="showDuplicateModal" id="bv-modal-dup-pub" title="Duplicate publication" centered>
      <template #default>
        <form @submit.stop.prevent>
          <ul>
            <li>
              This will duplicate this publication, ie copy the set up but not the submissions.
            </li>
            <li>
              You can choose whether or not to give the current publication users access to the new publication - and copy their roles across.
              You will be an owner of the new publication either way.
            </li>
          </ul>
          <b-form-group label="Name" label-for="pubname" label-cols-sm="2" :state="true">
            <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
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
import { useAuthStore } from '~/stores/auth'
import { useMailTemplatesStore } from '~/stores/mailtemplates'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const mailTemplatesStore = useMailTemplatesStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const sitepagesStore = useSitePagesStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const confirmpub = ref<any>(null)
const showDuplicateModal = ref(false)
const pubname = ref('')
const pubdupusers = ref(true)
const showdupwait = ref(false)
const editname = ref('')
const editdescription = ref('')
const savingdetails = ref(false)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
  loadDetails()
})

function loadDetails() {
  const p = pubsStore.getPub(pubid.value)
  if (p) {
    editname.value = p.name
    editdescription.value = p.description
  }
}

async function saveDetails() {
  try {
    savingdetails.value = true
    const ok = await api.pubs.editPubDetails(pubid.value, editname.value, editdescription.value)
    savingdetails.value = false
    if (ok) {
      await pubsStore.fetch()
      loadDetails()
      msgBoxOk('Name and description saved')
    } else {
      msgBoxFail('Saving went wrong')
    }
  } catch (e: any) {
    savingdetails.value = false
    msgBoxError('Error saving: ' + e.message)
  }
}

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SETUP' })
  return pub
})

const fatalerror = computed(() => {
  const error1 = usersStore.error
  return error1
})

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const issuper = computed(() => {
  return authStore.super
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

async function togglePubEnable(pub: any) {
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?', confirmTogglePubEnable)
}

async function confirmTogglePubEnable() {
  try {
    const ok = await api.pubs.toggleEnablePub(confirmpub.value.id, !confirmpub.value.enabled)
    if (ok) {
      // pub.enabled = !pub.enabled
      await pubsStore.fetch()
    } else {
      msgBoxFail('Toggling enable went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error toggling enable on publication: ' + e.message)
  }
}

async function deletePub(pub: any) {
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to delete this publication? Only a publication with no submissions can be deleted.', confirmDeletePub, null, null, null, 'danger')
}

async function confirmDeletePub() {
  console.log('deletePub')
  try {
    const ok = await api.pubs.deletePub(confirmpub.value.id)
    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        navigateTo('/panel')
      })
    } else {
      msgBoxFail('Delete went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error deleting publication: ' + e.message)
  }
}

function duplicatePub() {
  pubname.value = ''
  pubdupusers.value = true
  showdupwait.value = false
  showDuplicateModal.value = true
}

async function okDupPub() {
  try {
    pubname.value = pubname.value.trim()
    if (pubname.value.length === 0) return msgBoxOk('Please give a publication name')

    showdupwait.value = true
    const ok = await api.pubs.duplicatePub(pubid.value, pubname.value, pubdupusers.value)
    showdupwait.value = false
    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        showDuplicateModal.value = false
        msgBoxOk('Publication duplicated')
      })
    } else {
      msgBoxFail('Duplicate went wrong')
    }
  } catch (e: any) {
    showdupwait.value = false
    msgBoxError('Error duplicating publication: ' + e.message)
  }
}
</script>
