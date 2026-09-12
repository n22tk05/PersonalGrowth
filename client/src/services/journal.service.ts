import { api } from "@/lib/api";
import { MOOD } from "@/types";

export interface UpdateJournalPayload {
  name: string;
  content: string;
  mood: MOOD;
}
export interface CreateJournalPayload {
  name: string;
  content: string;
  mood: MOOD;
}

export interface Journal {
  id: string;
  name: string | null;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const journalApi = {
  getJournals: () => api.get<Journal[]>("/journals"),

  getJournal: (id: string) => api.get<Journal>(`/journals/${id}`),

  createJournal: (payload: CreateJournalPayload) =>
    api.post<Journal>("/journals", payload),

  updateJournal: (id: string, payload: UpdateJournalPayload) =>
    api.patch(`/journals/${id}`, payload),

  deleteJournal: (id: string) => api.delete(`/journals/${id}`),
};
