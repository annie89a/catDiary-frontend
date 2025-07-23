import apiClient from './api';
import axios from 'axios';
import type { CatEntryCreateModel, CatEntryUpdateModel } from '@/types/cat-entry';

export const getCatEntries = () => apiClient.get('/catEntry/list');

export const getCatEntryById = (id: number) => apiClient.get(`/catEntry/${id}`);

export const createCatEntry = (entry: CatEntryCreateModel) =>
  apiClient.post('/catEntry/create', entry);

export const updateCatEntry = (entry: CatEntryUpdateModel) =>
  apiClient.put('/catEntry/update', entry);

export const deleteCatEntry = (id: number) => apiClient.delete(`/catEntry/delete/${id}`);

export async function uploadCatImage(
  formData: FormData,
  options?: { onUploadProgress?: (progressEvent: any) => void; token?: string },
): Promise<{ data: { imageUrl: string } }> {
  try {
    const authToken = localStorage.getItem('authToken');
    const jwtToken = localStorage.getItem('jwtToken');
    const sessionToken = sessionStorage.getItem('authToken');
    const passedToken = options?.token;

    const token = passedToken || jwtToken || authToken || sessionToken;

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post('/apis/catEntry/upload-image', formData, {
      headers,
      withCredentials: true,
      onUploadProgress: options?.onUploadProgress,
    });

    return response;
  } catch (error) {
    throw error;
  }
}

export async function uploadCatImageWithMetadata(
  file: File,
  metadata: { catEntryId?: number; uploadedBy?: number },
  options?: { onUploadProgress?: (progressEvent: any) => void; token?: string },
): Promise<{ data: { imageUrl: string; fileId: string } }> {
  const formData = new FormData();
  formData.append('image', file);

  if (metadata.catEntryId) {
    formData.append('catEntryId', metadata.catEntryId.toString());
  }
  if (metadata.uploadedBy) {
    formData.append('uploadedBy', metadata.uploadedBy.toString());
  }

  try {
    const authToken = localStorage.getItem('authToken');
    const jwtToken = localStorage.getItem('jwtToken');
    const sessionToken = sessionStorage.getItem('authToken');
    const passedToken = options?.token;
    const token = passedToken || jwtToken || authToken || sessionToken;

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post('/apis/catEntry/upload-image', formData, {
      headers,
      withCredentials: true,
      onUploadProgress: options?.onUploadProgress,
    });

    return response;
  } catch (error) {
    throw error;
  }
}
