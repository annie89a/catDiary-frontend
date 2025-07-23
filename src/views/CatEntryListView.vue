<template>
  <div class="cat-entry-list-view">
    <h2>📃 All Cat Entries</h2>

    <div v-if="entries.length === 0" class="no-entries">
      No entries yet. Create your first cat entry!
    </div>

    <div class="entries-grid">
      <div v-for="entry in entries" :key="entry.id" class="entry-card">
        <!-- Cat Image -->
        <div v-if="getFullImageUrl(entry.imageUrl)" class="entry-image">
          <img
            :src="getFullImageUrl(entry.imageUrl)"
            :alt="`${entry.catName} image`"
            @error="handleImageError($event, entry)"
          />
        </div>
        <div v-else class="entry-image-placeholder">
          <span>🐱</span>
        </div>

        <!-- Entry Content -->
        <div class="entry-content">
          <h3 class="entry-title">
            {{ entry.catName }}
          </h3>

          <div class="entry-details">
            <p v-if="entry.location" class="detail-item">
              <strong>📍 Location:</strong> {{ entry.location }}
            </p>
            <p v-if="entry.mood" class="detail-item"><strong>😀 Mood:</strong> {{ entry.mood }}</p>
            <p v-if="entry.notes" class="detail-item">
              <strong>📝 Notes:</strong> {{ entry.notes }}
            </p>
            <p class="detail-item date">
              <small>📅 Created: {{ formatDate(entry.createdDate) }}</small>
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="entry-actions">
            <button @click="goToEdit(entry.id)" class="edit-btn">✏️ Edit</button>
            <button @click="deleteEntry(entry.id)" class="delete-btn">🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCatEntries, deleteCatEntry } from '@/api/cat-entry.api';

// Image URL helper function
const getFullImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  return `${backendUrl}/${cleanPath}`;
};

const entries = ref<any[]>([]);
const router = useRouter();

async function fetchEntries() {
  try {
    const response = await getCatEntries();
    entries.value = response.data.data;

    // Debug image URLs
    entries.value.forEach((entry) => {});
  } catch (error) {
    console.error('Failed to fetch entries:', error);
  }
}

onMounted(async () => {
  await fetchEntries();
});

function goToEdit(id: number) {
  router.push(`/entry/edit/${id}`);
}

async function deleteEntry(id: number) {
  if (confirm('Are you sure you want to delete this cat entry?')) {
    try {
      await deleteCatEntry(id);
      await fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

function handleImageError(event: Event, entry: any) {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
}
</script>

<style scoped>
.cat-entry-list-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  position: relative;
}

.cat-entry-list-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></svg>')
    repeat;
  pointer-events: none;
}

h2 {
  text-align: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
}

.no-entries {
  text-align: center;
  padding: 40px;
  color: white;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.entry-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.entry-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.entry-image {
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.entry-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.entry-card:hover .entry-image img {
  transform: scale(1.05);
}

.entry-image-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #bbb;
}

.entry-content {
  padding: 20px;
}

.entry-title {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.entry-details {
  margin-bottom: 20px;
}

.detail-item {
  margin: 8px 0;
  color: #555;
  line-height: 1.4;
}

.detail-item strong {
  color: #333;
}

.detail-item.date {
  color: #888;
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.entry-actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.edit-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
}

.edit-btn:active,
.delete-btn:active {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .cat-entry-list-view {
    padding: 1rem;
  }

  h2 {
    font-size: 2rem;
  }

  .entries-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .entry-content {
    padding: 15px;
  }

  .entry-title {
    font-size: 18px;
  }

  .entry-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .cat-entry-list-view {
    padding: 0.5rem;
  }

  h2 {
    font-size: 1.8rem;
  }

  .entry-image,
  .entry-image-placeholder {
    height: 150px;
  }

  .entry-image-placeholder {
    font-size: 36px;
  }
}
</style>
