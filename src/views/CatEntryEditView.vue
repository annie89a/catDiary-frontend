<template>
  <div class="edit-page">
    <!-- Home button -->
    <router-link to="/" class="home-button"> 🏠 Home </router-link>
    <div class="container">
      <h2>✏️ Edit Cat Entry</h2>

      <form @submit.prevent="submitEdit" class="entry-form">
        <input v-model="form.catName" placeholder="Cat Name" required />
        <input v-model="form.mood" placeholder="Mood" />
        <input v-model="form.location" placeholder="Location" />
        <textarea v-model="form.notes" placeholder="Notes"></textarea>

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
          <div v-if="displayImageUrl" class="image-preview">
            <img :src="displayImageUrl" alt="Cat preview" @error="handleImageError" />
            <button type="button" @click="clearImage" class="clear-image-btn">
              ❌ Remove Image
            </button>
          </div>
        </div>

        <button type="submit" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Update' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCatEntryById, updateCatEntry, uploadCatImage } from '@/api/cat-entry.api';
import type { CatEntryUpdateModel } from '@/types/cat-entry';
import { useUserStore } from '@/stores/userStore';

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

// Router
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const entryId = Number(route.params.id);

// Upload states
const uploading = ref(false);
const uploadProgress = ref(0);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

// Computed property for display image URL
const displayImageUrl = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value; // Show preview for newly selected file
  }
  return getFullImageUrl(form.value.imageUrl); // Show existing image with full URL
});

onMounted(async () => {
  try {
    const response = await getCatEntryById(entryId);

    // Access the nested data property
    const catData = response.data.data;

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
    router.push('/home');
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
    form.value.imageUrl = '';
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

    // Try different possible response structures
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
      form.value.imageUrl = imageUrl;

      // Clean up preview URL since we now have the permanent URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }

      return imageUrl;
    } else {
      throw new Error('No image URL in response');
    }
  } catch {
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
  form.value.imageUrl = '';

  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  console.warn('Failed to load image preview:', target.src);
}

// Submit edit
const submitEdit = async () => {
  try {
    // Upload image first if a file is selected
    if (selectedFile.value) {
      const uploadedImageUrl = await uploadImage();

      if (!uploadedImageUrl) {
        console.error('Image upload failed, stopping form submission');
        return;
      }
    }

    // Set modifiedBy
    form.value.modifiedBy = userStore.user?.data?.id;

    await updateCatEntry(form.value);

    router.push('/home');
  } catch {
    console.error('=== EDIT SUBMISSION FAILED ===');
    alert('Failed to update cat entry. Please try again.');
  }
};

// Cleanup on unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  position: relative;
}

.edit-page::before {
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

/* Responsive Design */
@media (max-width: 768px) {
  .edit-page {
    padding: 1rem;
  }

  h2 {
    font-size: 2rem;
  }

  .entry-form {
    padding: 1.5rem;
  }

  .image-upload-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.5rem;
  }

  .entry-form {
    padding: 1rem;
  }
}
</style>
