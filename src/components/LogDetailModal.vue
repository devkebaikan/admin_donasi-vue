<template>
  <b-modal
    :model-value="modelValue"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    title="Detail Log"
    size="lg"
    hide-footer
  >
    <div v-if="isLoading" class="text-center p-4">
      <b-spinner variant="primary" />
    </div>

    <div v-else-if="log">
      <b-row class="mb-3 gy-1">
        <b-col md="6"><strong>ID:</strong> {{ log.id }}</b-col>
        <b-col md="6">
          <strong>Waktu:</strong>
          {{ formatDate(log.created_at || log.request_timestamp) }}
        </b-col>
        <b-col md="6" v-if="log.service"><strong>Service:</strong> {{ log.service }}</b-col>
        <b-col md="6" v-if="log.source"><strong>Source:</strong> {{ log.source }}</b-col>
        <b-col md="6" v-if="log.endpoint"><strong>Endpoint:</strong> {{ log.endpoint }}</b-col>
        <b-col md="6" v-if="log.event"><strong>Event:</strong> {{ log.event }}</b-col>
        <b-col md="6" v-if="log.method"><strong>Method:</strong> {{ log.method }}</b-col>
        <b-col md="6">
          <strong>Status:</strong>
          <span :class="['badge ms-1', log.is_success ? 'bg-success' : 'bg-danger']">
            {{ log.is_success ? "Sukses" : "Gagal" }}
          </span>
        </b-col>
        <b-col md="6" v-if="log.duration_ms != null">
          <strong>Durasi:</strong> {{ log.duration_ms }} ms
        </b-col>
        <b-col md="6" v-if="log.response_status">
          <strong>Response Status:</strong> {{ log.response_status }}
        </b-col>
      </b-row>

      <div v-if="log.error_message" class="alert alert-danger py-2">
        {{ log.error_message }}
      </div>

      <b-tabs content-class="mt-2" small>
        <b-tab title="Request / Payload" active>
          <pre class="log-json">{{ pretty(log.request_body ?? log.payload) }}</pre>
        </b-tab>
        <b-tab title="Response" v-if="log.response_body">
          <pre class="log-json">{{ pretty(log.response_body) }}</pre>
        </b-tab>
        <b-tab title="Headers">
          <pre class="log-json">{{ pretty(log.request_headers ?? log.headers) }}</pre>
        </b-tab>
      </b-tabs>
    </div>

    <div class="d-flex justify-content-end gap-2 mt-3" v-if="log && canResend">
      <b-button variant="primary" :disabled="isResending" @click="onResend">
        <b-spinner v-if="isResending" small class="me-1" />
        <i v-else class="bx bx-repost me-1"></i>
        Resend
      </b-button>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  log: any;
  isLoading?: boolean;
  canResend?: boolean;
  isResending?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "resend", id: number): void;
}>();

const pretty = (value: any) => {
  if (value === null || value === undefined) return "-";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatDate = (value: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
};

const onResend = () => {
  if (props.log?.id) emit("resend", props.log.id);
};
</script>

<style scoped>
.log-json {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>