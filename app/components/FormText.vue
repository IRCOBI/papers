<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3" :state="true">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <b-form-textarea :id="sid" max-rows="100" v-model="modelValue2" style="overflow-y: auto;" :placeholder="reqd ? 'Required' : ''"
        :data-cy="'formtext-' + sid">
      </b-form-textarea>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview" :data-cy="'formtext-value' + sid">
        <p v-for="para in modelValueParas" class="pre-textarea">{{ para }}</p>
      </b-col>
      <b-col sm="1" class="formfieldview text-end">
        <span v-if="help" :title="help">
          <v-icon icon="info-circle" />
        </span>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  edit: { type: Boolean },
  reqd: { type: Boolean },
  label: { type: String },
  sid: { type: String },
  help: { type: String },
  helplink: { type: String },
  modelValue: { type: String },
  message: { type: String },
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue2 = ref('')

onMounted(() => {
  modelValue2.value = props.modelValue
})

// Watch for changes and emit to parent
watch(modelValue2, (newValue) => {
  emit('update:modelValue', newValue)
})

const labelreqd = computed(() => {
  return props.reqd ? props.label + ' *' : props.label
})

const modelValueParas = computed(() => {
  if (props.modelValue == null) return []
  return props.modelValue.split('\n')
})
</script>
