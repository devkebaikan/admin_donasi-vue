import HttpClient from "@/helpers/http-client";

export const getProgramShows = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/program-shows", { params });
    return res.data.data;
  } catch (error) {
    console.log("Error fetching all program shows", error);
    return [];
  }
};

export const deleteProgramShow = async (id: number) => {
  try {
    const res = await HttpClient.delete(`/settings/program-shows/${id}`);
    return true;
  } catch (error) {
    console.log("Error delete program show by id", error);
    throw error;
  }
};
