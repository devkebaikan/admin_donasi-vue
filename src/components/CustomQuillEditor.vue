<template>
  <div class="custom-quill-wrapper position-relative">
    <QuillEditor
      ref="quillEditorRef"
      :theme="theme"
      :toolbar="toolbar"
      :placeholder="placeholder"
      :read-only="readOnly"
      :content-type="contentType"
      :content="contentValue"
      :style="style"
      @ready="onEditorReady"
      @update:content="onUpdateContent"
      @text-change="emit('textChange', $event)"
      @selection-change="emit('selectionChange', $event)"
      @editor-change="emit('editorChange', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@vueup/vue-quill/dist/vue-quill.bubble.css";
import {
  DEFAULT_QUILL_TOOLBAR,
  createQuillImageHandler,
  attachQuillImageUploadListeners,
} from "@/helpers/quill-uploader";

interface Props {
  content?: string | any;
  modelValue?: string | any;
  contentType?: "html" | "delta" | "text";
  theme?: "snow" | "bubble" | "";
  toolbar?: any;
  placeholder?: string;
  readOnly?: boolean;
  storage?: string;
  style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  content: "",
  modelValue: undefined,
  contentType: "html",
  theme: "snow",
  toolbar: () => DEFAULT_QUILL_TOOLBAR,
  placeholder: "Tulis isi di sini...",
  readOnly: false,
  storage: "program-content",
  style: () => ({ height: "350px" }),
});

const emit = defineEmits<{
  (e: "update:content", value: any): void;
  (e: "update:modelValue", value: any): void;
  (e: "ready", quill: any): void;
  (e: "textChange", delta: any): void;
  (e: "selectionChange", range: any): void;
  (e: "editorChange", event: any): void;
  (e: "focus", editor: any): void;
  (e: "blur", editor: any): void;
}>();

const quillEditorRef = ref<any>(null);
let cleanupListeners: (() => void) | null = null;

// Support both v-model:content and v-model
const contentValue = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : props.content;
});

const onUpdateContent = (val: any) => {
  emit("update:content", val);
  emit("update:modelValue", val);
};

const onEditorReady = (quill: any) => {
  if (!quill) return;

  // 1. Override Toolbar Image button handler
  const toolbarModule = quill.getModule("toolbar");
  if (toolbarModule) {
    toolbarModule.addHandler(
      "image",
      createQuillImageHandler(quill, props.storage, () => {
        syncEditorContent(quill);
      })
    );
  }

  // 2. Attach paste & drag-drop image listeners
  cleanupListeners = attachQuillImageUploadListeners(
    quill,
    props.storage,
    () => {
      syncEditorContent(quill);
    }
  );

  emit("ready", quill);
};

const syncEditorContent = (quill: any) => {
  if (!quill) return;
  const html = quill.root.innerHTML;
  onUpdateContent(html);
};

onBeforeUnmount(() => {
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }
});

// Expose underlying Quill methods
const getQuill = () => quillEditorRef.value?.getQuill();
const getHTML = () => quillEditorRef.value?.getHTML();
const setHTML = (html: string) => quillEditorRef.value?.setHTML(html);
const getContents = () => quillEditorRef.value?.getContents();
const setContents = (content: any) => quillEditorRef.value?.setContents(content);
const getText = () => quillEditorRef.value?.getText();
const setText = (text: string) => quillEditorRef.value?.setText(text);
const focus = () => quillEditorRef.value?.focus();
const reinit = () => quillEditorRef.value?.reinit();

defineExpose({
  getQuill,
  getHTML,
  setHTML,
  getContents,
  setContents,
  getText,
  setText,
  focus,
  reinit,
});
</script>

<style scoped>
.custom-quill-wrapper :deep(.ql-editor) {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}
.custom-quill-wrapper :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}
</style>
