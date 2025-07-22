<template>
  <div>
    <h2>📃 All Cat Entries</h2>
    <div v-if="entries.length === 0">No entries yet.</div>
    <ul>
      <li v-for="entry in entries" :key="entry.id" class="entry-item">
        <h3>
          {{ entry.catName }} <small>({{ entry.mood }})</small>
        </h3>
        <p><strong>Location:</strong> {{ entry.location }}</p>
        <p><strong>Notes:</strong> {{ entry.notes }}</p>
        <p>
          <small>Created: {{ formatDate(entry.createdDate) }}</small>
        </p>
        <div v-if="entry.imageUrl">
          <img :src="entry.imageUrl" alt="Cat image" class="cat-image" />
        </div>
        <button @click="goToEdit(entry.id)">✏️ Edit</button>
        <button @click="deleteEntry(entry.id)">🗑️ Delete</button>
        <hr />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCatEntries, deleteCatEntry } from '@/api/cat-entry.api';

const entries = ref<any[]>([]);
const router = useRouter();

async function fetchEntries() {
  const response = await getCatEntries();
  entries.value = response.data.data;
}

onMounted(async () => {
  await fetchEntries();
});

function goToEdit(id: number) {
  router.push(`/entry/edit/${id}`);
}

async function deleteEntry(id: number) {
  await deleteCatEntry(id);
  await fetchEntries();
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
</script>

<style scoped>
.cat-image {
  max-width: 150px;
  border-radius: 8px;
  margin-top: 8px;
}
.entry-item {
  margin-bottom: 24px;
}
</style>
