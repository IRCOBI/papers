<template>
  <div>
    <!--
    Crucial component that displays a form to add or view - with organisers able to edit and/or delete the entry.
    General hierarchy: publication -> flow -> submit -> entry
    The form is used
      (a) when displaying an entry
      (b) when adding a new submit ie specify flowstageid to add as first of a new submit
      (c) when adding an entry to an existing ie specify flowstageid to add to the submit

    The computed property entry() crucially sets up the (existing or new) entry object with the right fields etc.
    For case (a) above the data is received as entry.values but moved into the relevant field.val.
    For cases (b) and (c) the received entry fields contain empty values - as set ip in store/submits action fetchformfields.
    -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <HelpAddStage v-if="formtype == 'addstage'" />
      <HelpAddSubmit v-if="formtype == 'addsubmit'" />
      <HelpEntry v-if="formtype == 'showedit'" />
      <Messages :error="error" :message="message" />

      <div class="ps-1">
        Your roles
        <strong v-if="issuper">SUPERADMIN</strong>
        <span v-for="myrole in pub.myroles">
          - {{ myrole.name }}
        </span>
      </div>

      <div v-if="submitid">
        <SubmitSummary :showtype="4" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="false" :setError="setError"
          :setMessage="setMessage" />
      </div>
      <div v-else>
        <h2>{{ flow.name }}</h2>
      </div>

      <!-- SHOW EXISTING OR NEW ENTRY -->
      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          {{ sectionheading }}
          <b-button v-if="pub.isowner && showingadminoptions" variant="outline-success" class="float-start me-2" @click="toggleEdit">
            {{ editbtntext }}
          </b-button>
          <b-button v-if="pub.isowner && showingadminoptions" variant="outline-warning" class="float-end" @click="deleteEntry(entry)">
            Delete
          </b-button>
        </h2>
        <b-form @submit="onSubmit" @submit.stop.prevent>
          <div v-if="formtype == 'addsubmit'" class="mt-2 ps-0 container">
            <FormInput type="text" :edit="editable" label="Paper title" sid="field0" help="" :class="fieldclass(submittitle)"
              :reqd="submittitle.required" :message="submittitle.message" @update:modelValue="changed(submittitle)" v-model="submittitle.val" />
          </div>
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 ps-0">
            <div v-if="field.type == 'plain'">{{field.label}}</div>
            <div v-if="field.type == 'heading'" class="font-weight-bold">{{field.label}}</div>
            <FormInput v-if="field.type == 'email'" type="email" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0, 4) == 'file'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message"
              v-on:input="changedFile($event, field)" :allowedfiletypes="field.allowedfiletypes" :existingfile="field.val.file"
              :relpath="entry.id + '/' + field.val.id" />
            <FormLookup v-if="field.type == 'lookup'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              :publookupId="field.publookupId" v-model="field.val.integer" />
            <FormLookups v-if="field.type == 'lookups'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              :publookupId="field.publookupId" v-model="field.val.string" />
            <FormRoleLookups v-if="field.type == 'rolelookups'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              :pubroleId="field.pubroleId" v-model="field.val.string" />
            <FormInput v-if="field.type == 'phone'" type="tel" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.string" />
            <FormInput v-if="field.type == 'string'" type="text" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.string" />
            <FormText v-if="field.type == 'text'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.text" />
            <FormYes v-if="field.type == 'yes'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.integer" />
            <FormYesNo v-if="field.type == 'yesno'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" @update:modelValue="changed(field)"
              v-model="field.val.integer" />
          </b-container>
          <b-container v-if="editable">
            <b-form-row>
              <b-col cols="9" offset-md="3">
                <b-button variant="success" type="submit" data-cy="entryform-submit">
                  Submit
                </b-button>
                <Messages :message="submitstatus" :warning="validationsummary" :error="submiterror" />
              </b-col>
            </b-form-row>
          </b-container>
        </b-form>
      </div>
    </div>
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

const props = defineProps({
  formtype: { type: String },
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const route = useRoute()

const error = ref('')
const message = ref('')
const editable = ref(false)
const validationsummary = ref('')
const submitstatus = ref('')
const submiterror = ref('')
const submittitle = reactive({
  required: true,
  message: '',
  val: '',
})

onMounted(async () => {
  if (props.formtype === 'addstage' || props.formtype === 'addsubmit') {
    editable.value = true
  }
  error.value = ''
  await pubsStore.clearError()
  await submitsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
  if (stageid.value) {
    await submitsStore.fetchformfields(stageid.value)
  }
  if (entryid.value) {
    await submitsStore.fetchentry(entryid.value)
  }
})

const issuper = computed(() => {
  return authStore.super
})

const pubid = computed(() => {
  return parseInt(route.params.pubid as string)
})

const flowid = computed(() => {
  return parseInt(route.params.flowid as string)
})

const submitid = computed(() => {
  return parseInt(route.params.submitid as string)
})

const entryid = computed(() => { // Some routes
  return parseInt(route.params.entryid as string)
})

const stageid = computed(() => { // Some routes
  return parseInt(route.params.stageid as string)
})

const fatalerror = computed(() => {
  const error1 = pubsStore.error
  const error2 = submitsStore.error
  return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
})

const editbtntext = computed(() => {
  const isadd = props.formtype == 'addsubmit'
  return editable.value ? 'View' : 'Edit'
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  // pub.isowner = true // Do this when testing faked API access restriction
  miscStore.set({ key: 'page-title', value: pub.name })
  return pub
})

const flow = computed(() => {
  const flows = submitsStore.flows(pubid.value)
  if (!flows) return false
  const flow = _.find(flows, _flow => { return _flow.id === flowid.value })
  if (!flow) error.value = "Flow not found: " + flowid.value
  return flow
})

const submit = computed(() => {
  const submit = submitsStore.submit(pubid.value, submitid.value)
  return submit // OK if not found ie for addsubmit
})

const showingadminoptions = computed(() => {
  return props.formtype === 'showedit' || props.formtype === 'addsubmit'
})

const entry = computed(() => { // Called every time for all user input changes
  if (stageid.value) {
    console.log('###GET ENTRY VIA STAGEID')
    const entry = submitsStore.stagefields(stageid.value)
    if (!entry) return false

    const currentFlow = flow.value
    if (!currentFlow) return false
    entry.stage = _.find(currentFlow.stages, stage => { return stage.id === stageid.value })
    return entry
  }
  if (entryid.value) {
    console.log('###GET ENTRY VIA ENTRYID', pubid.value, entryid.value)
    const flows = submitsStore.flows(pubid.value)
    if (!flows) return false

    const entry = submitsStore.entry(entryid.value)
    if (!entry) return false

    const currentFlow = _.find(flows, _flow => { return _flow.id === flowid.value })
    if (!currentFlow) return false

    entry.stage = _.find(currentFlow.stages, stage => { return stage.id === entry.flowstageId })

    for (const field of entry.fields) {
      const val = _.find(entry.values, value => {
        return value.formfieldId === field.id
      })
      field.val = val || {}
      field.val.newfile = null
    }
    return entry
  }
})

const sectionheading = computed(() => {
  const stagename = entry.value.stage.name
  const isadd = (props.formtype == 'addsubmit') || (props.formtype == 'addstage')
  return (editable.value ? (isadd ? 'Add ' : 'Edit ') : '') + stagename
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

async function onSubmit(evt: any) {
  try {
    const { $setLayoutMessage } = useNuxtApp()
    message.value = ''
    error.value = ''
    validationsummary.value = ''
    const entryData = {
      pubid: pubid.value,
      flowid: flowid.value,
      submitid: submitid.value,
      stageid: stageid.value,
      values: [],
    }
    if (entryid.value) entryData.id = entryid.value
    // Do required validation and do requiredif validation
    let anyerror = false
    if (props.formtype == 'addsubmit') {
      if (submittitle.val.length == 0) {
        submittitle.message = 'This field is required'
        anyerror = true
      }
    }
    for (const field of entry.value.fields) {
      field.message = ''
      const fv = {
        formfieldid: field.id,
        string: field.val.string ?? null,
        integer: field.val.integer ?? null,
        text: field.val.text ?? null,
        //file: field.val.newfile ? field.val.newfile.name : null,
        existingfile: field.val.file ?? null,
        file: field.val.newfile ?? null,
      }
      if (field.val.newfile) { // View filename
        field.val.file = field.val.newfile.name // field.val.file = field.val.newfile.name
      }
      //console.log(field.id, field.type, field.required, field.requiredif, field.val)
      let got = true
      let lengthalreadywarned = false
      switch (field.type) {
        case 'text':
          got = fv.text !== null && fv.text.length > 0
          break
        case 'string':
        case 'phone':
        case 'email':
        case 'rolelookups':
        case 'lookups':
          got = fv.string !== null && fv.string.length > 0; break
        case 'yes':
        case 'yesno':
          got = fv.integer !== null
          break
        case 'lookup':
          got = fv.integer !== null
          break
        case 'file':
          got = fv.existingfile != null || fv.file !== null
          break
      }
      if (field.required) {
        if (!got) {
          anyerror = true
          field.message = 'This field is required. '
        }
      }
      if (field.maxchars || field.maxwords) {
        let tocheckmax = false
        if (field.type === 'string') {
          if (fv.string !== null) tocheckmax = fv.string
        }
        if (field.type === 'text') {
          if (fv.text !== null) tocheckmax = fv.text
        }
        if (field.maxchars && tocheckmax) {
          if (tocheckmax.length > field.maxchars) {
            field.message += 'You have ' + tocheckmax.length + ' characters - the maximum is ' + field.maxchars + '. '
            anyerror = true
            lengthalreadywarned = true
          }
        }
        if (field.maxwords && tocheckmax) {
          const matches = tocheckmax.match(/\S+/g)
          if (matches && (matches.length > field.maxwords)) {
            field.message += 'You have ' + matches.length + ' words - the maximum is ' + field.maxwords + '. '
            anyerror = true
            lengthalreadywarned = true
          }
        }
      }
      if (field.requiredif && !got) { // Only copes with: required if <fieldid>=<integer>
        const reffield = parseInt(field.requiredif)
        const eqpos = field.requiredif.indexOf('=')
        const mustequal = parseInt(field.requiredif.substring(eqpos + 1))
        if (reffield && eqpos !== -1) {
          let checkok = false
          for (const checkfield of entry.value.fields) {
            if (checkfield.id === reffield) {
              const cfi = checkfield.val.integer
              if (cfi !== mustequal) {
                checkok = true
                break
              }
            }
          }
          if (!checkok) {
            anyerror = true
            field.message = 'This field is required. '
          }
        }
      }
      if ((fv.string !== null) && (!lengthalreadywarned) && (fv.string.length > 255)) { // String simply truncated to 255 in API
        anyerror = true
        field.message = 'The maximum string length is 255 characters. '
      }
      entryData.values.push(fv)
    }
    if (anyerror) {
      validationsummary.value = 'Please fix any issues to continue'
      return
    }

    submitstatus.value = 'Please wait: submitting'
    submiterror.value = ''
    if (props.formtype == 'addsubmit') { // ADD SUBMIT AND ENTRY
      entryData.submitid = 0
      entryData.title = submittitle.val
      const data = await api.submit.addSubmitEntry(entryData, flowid.value)
      const newEntryId = data.rv.id
      submitstatus.value = ''
      if (newEntryId) {
        editable.value = false
        $setLayoutMessage('Submitted OK. You should receive a confirmation email.')
        // OK: redirect so new entry displayed properly
        navigateTo('/panel/' + pubid.value + '/' + flowid.value + '/' + data.rv.submitid + '/' + newEntryId)
      } else {
        error.value = 'Save error'
      }
    } else if (entryid.value) {  // EDIT ENTRY
      const returnedid = await api.submit.editEntry(entryData)
      submitstatus.value = ''
      if (returnedid) {
        editable.value = false
        message.value = 'Updated OK'
        await submitsStore.fetchentry(entryid.value) // To get file relpath anew
      } else {
        error.value = 'Save error'
        submiterror.value = 'Save error'
      }
    } else { // ADD ENTRY
      const data = await api.submit.addEntry(entryData)
      const newEntryId = data.rv.id
      submitstatus.value = ''
      if (newEntryId) {
        editable.value = false
        $setLayoutMessage('Submitted OK. You should receive a confirmation email.')
        // OK: redirect so new entry displayed properly
        navigateTo('/panel/' + pubid.value + '/' + flowid.value + '/' + submitid.value + '/' + newEntryId)
      } else {
        error.value = 'Save error'
        submiterror.value = 'Save error'
      }
      // Could redirect here: /panel/2/1/3/<id>
    }
    return false
  } catch (e: any) {
    error.value = e.message
    submiterror.value = e.message
    submitstatus.value = ''
  }
}

function changedFile(file: File, field: any) {
  if ('name' in file) {
    field.message = ''
    field.val.newfile = file
    validationsummary.value = ''
  }
}

function changed(field: any) {
  //console.log('ENTRYFORM field changed',field, field.val, field.val.string, field.val.text)
  field.message = ''
  validationsummary.value = ''
}

function fieldclass(field: any) {
  return field.message.length > 0 ? 'border border-warning' : ''
}

function toggleEdit() {
  editable.value = !editable.value
}

function deleteEntry(entry: any) {
  error.value = ''
  showConfirm(entry.stage.name, 'Are you sure you want to delete this entry?', confirmDeleteEntry)
}

async function confirmDeleteEntry() {
  try {
    const deleted = await api.submit.deleteEntry(entryid.value)
    if (!deleted) {
      error.value = 'Could not delete this entry'
      return
    }
    showConfirm('Entry deleted', 'Note: no statuses removed', doneDeleteEntry, 'OK', '')
  } catch (e: any) {
    error.value = e.message
  }
}

function doneDeleteEntry() {
  navigateTo('/panel/' + pubid.value + '/' + flowid.value + '/' + submitid.value)
}
</script>
<style>
.status {
  font-weight: bold;
  color: green;
}
</style>
