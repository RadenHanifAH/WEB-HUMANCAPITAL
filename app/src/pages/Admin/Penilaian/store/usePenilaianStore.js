/* eslint-disable no-unused-vars */
import { create } from "zustand";
import * as penilaianApi from "./api/PenilaianApi";

const usePenilaianStore = create((set, get) => ({
  // ---------- state ----------
  loading: false,
  error: null,
  successMessage: null,

  psikotestList: [],
  psikotestTotal: 0,

  interviewList: [],
  interviewTotal: 0,

  // ✅ state untuk halaman "Dokumen Penilaian"
  documentsList: [],
  documentsLoading: false,
  documentsError: null,
  documentsLastQuery: "",

  // ---------- helpers ----------
  clearMessages: () => set({ error: null, successMessage: null }),

  // ---------- PREFILL ----------
  loadPrefillData: async (applicationId) => {
    try {
      const { item } = await penilaianApi.fetchPrefillData(applicationId);
      return item;
    } catch (e) {
      return null;
    }
  },

  // ---------- PSIKOTEST actions ----------
  loadPsikotestList: async (params) => {
    set({ loading: true, error: null });
    try {
      const { items, total } = await penilaianApi.fetchPsikotestList(params);
      set({ psikotestList: items, psikotestTotal: total, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  submitPsikotest: async (payload, id = null) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const result = id
        ? await penilaianApi.updatePsikotest(id, payload)
        : await penilaianApi.createPsikotest(payload);
      set({ loading: false, successMessage: result.message });

      // ✅ refresh Dokumen Penilaian otomatis setelah berhasil simpan
      get().loadAssessmentDocuments(get().documentsLastQuery);

      return result.item;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  removePsikotest: async (id) => {
    set({ loading: true, error: null });
    try {
      await penilaianApi.deletePsikotest(id);
      set((state) => ({
        psikotestList: state.psikotestList.filter((item) => item.id !== id),
        loading: false,
      }));
      get().loadAssessmentDocuments(get().documentsLastQuery);
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // ---------- INTERVIEW actions ----------
  loadInterviewList: async (params) => {
    set({ loading: true, error: null });
    try {
      const { items, total } = await penilaianApi.fetchInterviewList(params);
      set({ interviewList: items, interviewTotal: total, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  loadInterviewByApplication: async (applicationId, stage) => {
    try {
      const { item } = await penilaianApi.fetchInterviewByApplication(
        applicationId,
        stage,
      );
      return item;
    } catch (e) {
      return null;
    }
  },

  submitInterview: async (payload, id = null) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const result = id
        ? await penilaianApi.updateInterview(id, payload)
        : await penilaianApi.createInterview(payload);
      set({ loading: false, successMessage: result.message });

      // ✅ INI KUNCINYA: begitu hasil wawancara berhasil disimpan,
      // langsung refresh Dokumen Penilaian supaya data baru langsung
      // terlihat tanpa perlu reload manual.
      get().loadAssessmentDocuments(get().documentsLastQuery);

      return result.item;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  removeInterview: async (id) => {
    set({ loading: true, error: null });
    try {
      await penilaianApi.deleteInterview(id);
      set((state) => ({
        interviewList: state.interviewList.filter((item) => item.id !== id),
        loading: false,
      }));
      get().loadAssessmentDocuments(get().documentsLastQuery);
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // ---------- DOKUMEN PENILAIAN ----------
  loadAssessmentDocuments: async (q = "") => {
    set({ documentsLoading: true, documentsError: null, documentsLastQuery: q });
    try {
      const { items } = await penilaianApi.fetchAssessmentDocuments(q);
      set({ documentsList: items, documentsLoading: false });
    } catch (e) {
      set({ documentsError: e.message, documentsLoading: false });
    }
  },
}));

export default usePenilaianStore;