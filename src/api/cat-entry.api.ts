import apiClient from './api';
import type { CatEntryCreateModel, CatEntryUpdateModel } from '@/types/cat-entry';

export const getCatEntries = () => apiClient.get('/catEntry/list');

export const getCatEntryById = (id: number) => apiClient.get(`/catEntry/${id}`);

export const createCatEntry = (entry: CatEntryCreateModel) =>
  apiClient.post('/catEntry/create', entry);

export const updateCatEntry = (entry: CatEntryUpdateModel) =>
  apiClient.put('/catEntry/update', entry);

export const deleteCatEntry = (id: number) => apiClient.delete(`/catEntry/delete/${id}`);
