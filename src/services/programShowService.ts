// FILE: src/services/programShowService.ts
import HttpClient from "@/helpers/http-client";

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type ProgramShowType =
  | "darurat"
  | "home"
  | "rutin"
  | "ramadhan"
  | "recommend"

// Mengikuti AllProgramShowTypes di internal/module/setting/dto/program_show.go
export const PROGRAM_SHOW_TYPES: { value: ProgramShowType; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "darurat", label: "Darurat" },
  { value: "rutin", label: "Rutin" },
  { value: "ramadhan", label: "Ramadhan" },
  { value: "recommend", label: "Rekomendasi" },
];

export interface ProgramBrief {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

export interface ProgramShow {
  id: number;
  program_id?: number | null;
  type: string;
  created_at?: string | null;
  updated_at?: string | null;
  program?: ProgramBrief | null;
}

export interface ProgramShowListParams {
  program_id?: number;
  type?: string;
  mode?: "pagination" | "list";
  limit?: number;
  page?: number;
}

export interface CreateProgramShowPayload {
  program_id: number;
  type: ProgramShowType;
}

export interface UpdateProgramShowPayload {
  program_id?: number;
  type?: ProgramShowType;
}

// ──────────────────────────────────────────────────────────────────────────
// API calls
// ──────────────────────────────────────────────────────────────────────────

export const getProgramShows = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/program-shows", { params });
    return res.data.data;
  } catch (error) {
    console.log("Error fetching all program shows", error);
    return [];
  }
};

export const getProgramShowById = async (id: number): Promise<ProgramShow | null> => {
  try {
    const res = await HttpClient.get(`/settings/program-shows/${id}`);
    return res.data.data;
  } catch (error) {
    console.log("Error fetching program show by id", error);
    throw error;
  }
};

export const createProgramShow = async (payload: CreateProgramShowPayload) => {
  try {
    const res = await HttpClient.post("/settings/program-shows", payload);
    return res.data.data;
  } catch (error) {
    console.log("Error creating program show", error);
    throw error;
  }
};

export const updateProgramShow = async (
  id: number,
  payload: UpdateProgramShowPayload,
) => {
  try {
    const res = await HttpClient.put(`/settings/program-shows/${id}`, payload);
    return res.data.data;
  } catch (error) {
    console.log("Error updating program show", error);
    throw error;
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

// ──────────────────────────────────────────────────────────────────────────
// Helper: cari program untuk dropdown pemilihan program
// NOTE: sesuaikan endpoint ini dengan module "program" yang sudah ada di proyekmu
// (mis. GET /programs?search=&limit=&mode=list)
// ──────────────────────────────────────────────────────────────────────────

export const searchPrograms = async (
  search = "",
  limit = 20,
): Promise<ProgramBrief[]> => {
  try {
    const res = await HttpClient.get("/programs", {
      params: { search, limit, mode: "list" },
    });
    return res.data.data ?? [];
  } catch (error) {
    console.log("Error searching programs", error);
    return [];
  }
};