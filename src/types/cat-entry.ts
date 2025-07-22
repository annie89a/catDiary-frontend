// src/types/cat-entry.ts

export interface CatEntry {
  id: number;
  catName: string;
  mood: string;
  location: string;
  notes: string;
  imageUrl: string;
  createdBy?: number;
  modifiedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatEntryCreateModel {
  catName: string;
  mood: string;
  location: string;
  notes: string;
  imageUrl: string;
  createdBy?: number;
}

export interface CatEntryUpdateModel {
  id: number;
  catName: string;
  mood: string;
  location: string;
  notes: string;
  imageUrl: string;
  modifiedBy?: number;
}
