<template>
  <div class="cat-entry-edit-view">
    <h1>Edit Cat Entry</h1>

    <form @submit.prevent="submitEdit">
      <div>
        <label for="catName">Cat Name:</label>
        <input v-model="form.catName" id="catName" type="text" required />
      </div>

      <div>
        <label for="mood">Mood:</label>
        <input v-model="form.mood" id="mood" type="text" />
      </div>

      <div>
        <label for="location">Location:</label>
        <input v-model="form.location" id="location" type="text" />
      </div>

      <div>
        <label for="notes">Notes:</label>
        <textarea v-model="form.notes" id="notes"></textarea>
      </div>

      <div>
        <label for="imageUrl">Image URL:</label>
        <input v-model="form.imageUrl" id="imageUrl" type="text" />
      </div>

      <button type="submit">Update Entry</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCatEntryById, updateCatEntry } from '@/api/cat-entry.api';
import type { CatEntryUpdateModel } from '@/types/cat-entry';

// Router
const route = useRoute();
const router = useRouter();
const entryId = Number(route.params.id);

// Form
const form = ref<CatEntryUpdateModel>({
  id: entryId,
  catName: '',
  mood: '',
  location: '',
  notes: '',
  imageUrl: '',
  modifiedBy: undefined,
});

onMounted(async () => {
  try {
    const response = await getCatEntryById(entryId);
    console.log('response:::', response);

    // Access the nested data property
    const catData = response.data.data;
    console.log('catData:::', catData);

    if (catData) {
      form.value.id = catData.id;
      form.value.catName = catData.catName;
      form.value.mood = catData.mood;
      form.value.location = catData.location;
      form.value.notes = catData.notes;
      form.value.imageUrl = catData.imageUrl;
      form.value.modifiedBy = undefined;
    }
  } catch (error) {
    console.error('Failed to load cat entry:', error);
    router.push('/entry/list');
  }
});

// Submit edit
const submitEdit = async () => {
  try {
    await updateCatEntry(form.value);
    router.push('/entry/list');
  } catch (error) {
    console.error('Failed to update entry:', error);
  }
};
</script>

<style scoped>
.cat-entry-edit-view {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
</style>
