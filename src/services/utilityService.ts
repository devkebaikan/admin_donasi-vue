import HttpClient from "@/helpers/http-client";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await HttpClient.post("/utility/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
