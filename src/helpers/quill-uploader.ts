import { uploadImage } from "@/services/utilityService";
import { toast } from "vue3-toastify";

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const DEFAULT_QUILL_TOOLBAR = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "super" }, { script: "sub" }],
  [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ["direction", { align: [] }],
  ["link", "image", "video"],
  ["clean"],
];

/**
 * Validasi dan upload file gambar ke server
 */
export const handleUploadImageFile = async (
  file: File,
  storage: string = "program-content",
  options?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  }
): Promise<string | null> => {
  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_IMAGE_SIZE_BYTES;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_IMAGE_TYPES;

  if (!allowedTypes.includes(file.type)) {
    toast.error("Format gambar harus JPEG, PNG, WebP, atau GIF.", {
      position: "top-center",
    });
    return null;
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = Math.round(maxSizeBytes / (1024 * 1024));
    toast.error(`Ukuran gambar maksimal ${sizeMb}MB.`, {
      position: "top-center",
    });
    return null;
  }

  const toastId = toast.loading("Mengunggah gambar...", {
    position: "top-center",
  });

  try {
    const imageUrl = await uploadImage(file, storage);
    toast.update(toastId, {
      render: "Gambar berhasil diunggah!",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });
    return imageUrl;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ??
      error?.message ??
      "Gagal mengunggah gambar ke server.";
    toast.update(toastId, {
      render: msg,
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    return null;
  }
};

/**
 * Handler tombol toolbar 'image' untuk Quill Editor
 */
export const createQuillImageHandler = (
  quill: any,
  storage: string = "program-content",
  onInserted?: () => void
) => {
  return function (this: any) {
    const q = quill || this.quill;
    if (!q) return;

    // Simpan posisi cursor sebelum file picker dibuka
    const selection = q.getSelection();
    const cursorIndex =
      selection && typeof selection.index === "number"
        ? selection.index
        : Math.max(0, q.getLength() - 1);

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", DEFAULT_ALLOWED_IMAGE_TYPES.join(","));

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const imageUrl = await handleUploadImageFile(file, storage);
      if (imageUrl) {
        // Pastikan editor aktif dan fokus
        q.enable(true);
        q.focus();

        const currentLen = q.getLength();
        const insertPos = Math.min(cursorIndex, Math.max(0, currentLen - 1));

        // Sisipkan gambar ke editor
        q.insertEmbed(insertPos, "image", imageUrl, "api");
        // Geser kursor ke setelah gambar
        q.setSelection(insertPos + 1, 0, "api");

        onInserted?.();
      }
    };

    input.click();
  };
};

/**
 * Pasang listener Paste dan Drag-Drop gambar pada Quill Editor
 * untuk mencegah Base64 dan mengunggah langsung ke API /utility/upload-image
 */
export const attachQuillImageUploadListeners = (
  quill: any,
  storage: string = "program-content",
  onInserted?: () => void
) => {
  if (!quill || !quill.root) return () => {};

  const root = quill.root as HTMLElement;

  // 1. Intercept Paste
  const handlePaste = async (event: ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    const items = Array.from(clipboardData.items);
    const imageItems = items.filter(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    );

    if (imageItems.length === 0) return;

    // Ada file gambar di clipboard, cegah default paste base64
    event.preventDefault();

    const selection = quill.getSelection();
    let insertPos =
      selection && typeof selection.index === "number"
        ? selection.index
        : Math.max(0, quill.getLength() - 1);

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;

      const imageUrl = await handleUploadImageFile(file, storage);
      if (imageUrl) {
        quill.enable(true);
        quill.focus();

        quill.insertEmbed(insertPos, "image", imageUrl, "api");
        insertPos += 1;
        quill.setSelection(insertPos, 0, "api");

        onInserted?.();
      }
    }
  };

  // 2. Intercept Drop
  const handleDrop = async (event: DragEvent) => {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !dataTransfer.files) return;

    const files = Array.from(dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    // Ada file gambar di drop, cegah default drop base64
    event.preventDefault();

    const selection = quill.getSelection();
    let insertPos =
      selection && typeof selection.index === "number"
        ? selection.index
        : Math.max(0, quill.getLength() - 1);

    for (const file of imageFiles) {
      const imageUrl = await handleUploadImageFile(file, storage);
      if (imageUrl) {
        quill.enable(true);
        quill.focus();

        quill.insertEmbed(insertPos, "image", imageUrl, "api");
        insertPos += 1;
        quill.setSelection(insertPos, 0, "api");

        onInserted?.();
      }
    }
  };

  root.addEventListener("paste", handlePaste);
  root.addEventListener("drop", handleDrop);

  // Return cleanup function
  return () => {
    root.removeEventListener("paste", handlePaste);
    root.removeEventListener("drop", handleDrop);
  };
};
