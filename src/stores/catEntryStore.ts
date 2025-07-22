import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as api from '@/api/cat-entry.api';

export const useCatEntryStore = defineStore('catEntry', () => {
  const entries = ref<any[]>([]);
  const selectedEntry = ref<any | null>(null);

  const fetchAll = async () => {
    const response = await api.getCatEntries();
    entries.value = response.data.data;
  };

  const fetchById = async (id: number) => {
    const response = await api.getCatEntryById(id);
    selectedEntry.value = response.data.data;
  };

  const create = async (entry: any) => {
    const response = await api.createCatEntry(entry);
    return response.data;
  };

  const update = async (entry: any) => {
    const response = await api.updateCatEntry(entry);
    return response.data;
  };

  const remove = async (id: number) => {
    const response = await api.deleteCatEntry(id);
    return response.data;
  };

  return { entries, selectedEntry, fetchAll, fetchById, create, update, remove };
});
