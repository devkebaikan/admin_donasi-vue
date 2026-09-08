import HttpClient from "@/helpers/http-client";

export interface UploadImageResult {
  imageUrl: string;
  filename: string;
  storage: string;
}

export interface UploadImageApiResponse {
  data: UploadImageResult;
  message: string;
  status: number;
}

/**
 * Upload image file to storage endpoint (/utility/upload-image)
 * @param file Image file (jpeg, png, webp, gif, max 5MB)
 * @param storage Storage folder name (default: "program-content")
 * @returns Direct image URL string
 */
export const uploadImage = async (
  file: File,
  storage: string = "program-content"
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("storage", storage);

  try {
    const res = await HttpClient.post<UploadImageApiResponse>(
      "/utility/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const imageUrl = res.data?.data?.imageUrl ?? (res.data as any)?.imageUrl;
    if (!imageUrl) {
      throw new Error("URL gambar tidak ditemukan pada response server.");
    }
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

