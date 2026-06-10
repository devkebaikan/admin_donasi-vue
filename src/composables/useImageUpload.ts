import { ref } from "vue";

interface UseImageUploadOptions {
  maxSizeMB?: number;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const maxSizeMB = options.maxSizeMB ?? 2;

  const file = ref<File | null>(null);
  const preview = ref<string | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const setFile = (selectedFile: File) => {
    file.value = selectedFile;

    const reader = new FileReader();

    reader.onload = (e) => {
      preview.value = e.target?.result as string;
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    if (!selectedFile) return;

    const maxBytes = maxSizeMB * 1024 * 1024;

    if (selectedFile.size > maxBytes) {
      alert(`Ukuran file maksimal ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
  };

  const clear = () => {
    file.value = null;
    preview.value = null;

    if (fileInput.value) {
      fileInput.value.value = "";
    }
  };

  return {
    file,
    preview,
    fileInput,
    triggerFileInput,
    handleChange,
    clear,
    setFile,
  };
}
