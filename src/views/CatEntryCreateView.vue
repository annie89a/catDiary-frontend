<template>
  <div class="create-page">
    <!-- Home button -->
    <router-link to="/" class="home-button"> 🏠 Home </router-link>

    <div class="container">
      <h2>{{ isEdit ? '✏️ Edit Cat Entry' : '➕ Create Cat Entry' }}</h2>
      <form @submit.prevent="submitForm" class="entry-form">
        <input v-model="entry.catName" placeholder="Cat Name" required />
        <input v-model="entry.mood" placeholder="Mood" required />
        <input v-model="entry.location" placeholder="Location" required />
        <textarea v-model="entry.notes" placeholder="Notes"></textarea>

        <!-- Image upload section -->
        <div class="image-upload-section">
          <h3>Cat Image</h3>

          <!-- File input for upload -->
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept="image/*"
            :disabled="uploading"
          />

          <!-- Upload progress -->
          <div v-if="uploading" class="upload-progress">Uploading... {{ uploadProgress }}%</div>

          <!-- Image preview -->
          <div v-if="previewUrl || entry.imageUrl" class="image-preview">
            <img :src="previewUrl || entry.imageUrl" alt="Cat preview" @error="handleImageError" />
            <button type="button" @click="clearImage" class="clear-image-btn">
              ❌ Remove Image
            </button>
          </div>
        </div>

        <button type="submit" :disabled="uploading">
          {{ uploading ? 'Uploading...' : isEdit ? 'Update' : 'Create' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createCatEntry,
  getCatEntryById,
  updateCatEntry,
  uploadCatImage,
} from '@/api/cat-entry.api';
import type { CatEntry, CatEntryCreateModel, CatEntryUpdateModel } from '@/types/cat-entry';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isEdit = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    selectedFile.value = file;

    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = URL.createObjectURL(file);

    // Clear the URL input when file is selected
    entry.value.imageUrl = '';
  }
}

async function uploadImage() {
  if (!selectedFile.value) return null;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);

    const response = await uploadCatImage(formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });

    let imageUrl = null;
    if (response.data?.imageUrl) {
      imageUrl = response.data.imageUrl;
    } else if (response.data?.url) {
      imageUrl = response.data.url;
    } else if (typeof response.data === 'string') {
      imageUrl = response.data;
    } else if (response.data?.data?.imageUrl) {
      imageUrl = response.data.data.imageUrl;
    }

    if (imageUrl) {
      entry.value.imageUrl = imageUrl;

      // Clean up preview URL since we now have the permanent URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }

      return imageUrl;
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    alert('Image upload failed. Please try again.');
    return null;
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
}

function clearImage() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  selectedFile.value = null;
  entry.value.imageUrl = '';

  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleImageError() {
  console.warn('Failed to load image preview');
}

async function submitForm() {
  try {
    // Upload image first if a file is selected
    if (selectedFile.value) {
      const uploadedImageUrl = await uploadImage();

      if (!uploadedImageUrl) {
        console.error('Image upload failed, stopping form submission');
        return;
      }
    }

    if (isEdit.value) {
      const updateData: CatEntryUpdateModel = {
        ...(entry.value as CatEntry),
        modifiedBy: userStore.user?.data?.id,
      };

      const response = await updateCatEntry(updateData);
    } else {
      const createData: CatEntryCreateModel = {
        ...(entry.value as CatEntry),
        createdBy: userStore.user?.data?.id,
      };

      const response = await createCatEntry(createData);
    }

    router.push('/home');
  } catch (error) {
    console.error('=== FORM SUBMISSION FAILED ===');
    console.error('Error:', error);
    console.error('Error response:', error.response?.data);
    alert('Failed to save cat entry. Please try again.');
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  position: relative;
}

.create-page::before {
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

.home-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  color: white;
  text-decoration: none;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.entry-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.image-upload-section {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.image-upload-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: white;
  font-weight: 600;
}

.upload-progress {
  margin: 10px 0;
  padding: 12px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  text-align: center;
  color: white;
  font-weight: 600;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.clear-image-btn {
  display: block;
  margin: 15px auto 0;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(244, 67, 54, 0.3);
}

.clear-image-btn:hover {
  background: rgba(211, 47, 47, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.entry-form input,
.entry-form textarea {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.entry-form input::placeholder,
.entry-form textarea::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.entry-form input:focus,
.entry-form textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.entry-form textarea {
  min-height: 100px;
  resize: vertical;
}

.entry-form button {
  display: block;
  width: 100%;
  padding: 15px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

.entry-form button:hover:not(:disabled) {
  background: rgba(76, 175, 80, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.entry-form button:disabled {
  background: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-page {
    padding: 1rem;
  }

  .home-button {
    top: 1rem;
    left: 1rem;
    padding: 10px 16px;
    font-size: 14px;
  }

  h2 {
    font-size: 2rem;
    margin-top: 1rem;
  }

  .entry-form {
    padding: 1.5rem;
  }

  .image-upload-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .home-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .entry-form {
    padding: 1rem;
  }
}
</style>
