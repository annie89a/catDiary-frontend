<template>
  <div>
    <h2>{{ isEdit ? '✏️ Edit Cat Entry' : '➕ Create Cat Entry' }}</h2>
    <form @submit.prevent="submitForm">
      <input v-model="entry.catName" placeholder="Cat Name" required />
      <input v-model="entry.mood" placeholder="Mood" required />
      <input v-model="entry.location" placeholder="Location" required />
      <textarea v-model="entry.notes" placeholder="Notes"></textarea>
      <input v-model="entry.imageUrl" placeholder="Image URL" />
      <button type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createCatEntry, getCatEntryById, updateCatEntry } from '@/api/cat-entry.api';
import type { CatEntry, CatEntryCreateModel, CatEntryUpdateModel } from '@/types/cat-entry';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isEdit = ref(false);

const entry = ref<Partial<CatEntry>>({
  id: 0,
  catName: '',
  mood: '',
  location: '',
  notes: '',
  imageUrl: '',
});

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true;
    const response = await getCatEntryById(+route.params.id);
    entry.value = response.data;
  }
});

async function submitForm() {
  if (isEdit.value) {
    const updateData: CatEntryUpdateModel = {
      ...(entry.value as CatEntry),
      modifiedBy: userStore.user?.data?.id,
    };
    await updateCatEntry(updateData);
  } else {
    const createData: CatEntryCreateModel = {
      ...(entry.value as CatEntry),
      createdBy: userStore.user?.data?.id,
    };
    await createCatEntry(createData);
  }
  router.push('/entry/list');
}
</script>
