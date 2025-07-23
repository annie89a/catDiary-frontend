<template>
  <div class="home">
    <div v-if="userStore.user" class="top-nav">
      <router-link to="/entry/create" class="create-btn">
        <span class="btn-icon">✏️</span>
        Create Entry
      </router-link>
      <button class="logout-btn" @click="logout">
        <span class="logout-icon">🚪</span>
        Logout
      </button>
    </div>

    <div class="header">
      <div class="cat-icon">🐱</div>
      <h1 class="title">Cat Diary</h1>
      <p class="subtitle">Track your feline friend's adventures</p>
    </div>

    <div v-if="userStore.user" class="user-section">
      <div class="welcome-card">
        <p class="welcome-text">
          Welcome back, <span class="username">{{ userStore.user.username }}</span
          >!👋
        </p>
      </div>

      <!-- Cat Entries Section -->
      <div class="entries-section">
        <h2 class="entries-title">📃 Your Cat Entries</h2>

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
                <span class="mood-badge">{{ entry.mood }}</span>
              </h3>

              <div class="entry-details">
                <p v-if="entry.location" class="detail-item">
                  <strong>📍 Location:</strong> {{ entry.location }}
                </p>
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
    </div>

    <div v-else class="auth-section">
      <div class="auth-card">
        <div class="auth-header">
          <div class="paw-prints">🐾</div>
          <h2>Join the Cat Community</h2>
          <p>Start documenting your cat's journey today</p>
        </div>

        <div class="auth-buttons">
          <router-link to="/login" class="auth-btn login-btn">
            <span class="btn-icon">🔑</span>
            Login
          </router-link>
          <router-link to="/register" class="auth-btn register-btn">
            <span class="btn-icon">📝</span>
            Register
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { getCatEntries, deleteCatEntry } from '@/api/cat-entry.api';

const userStore = useUserStore();
const router = useRouter();
const entries = ref<any[]>([]);

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

async function fetchEntries() {
  try {
    const response = await getCatEntries();
    entries.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch entries:', error);
  }
}

onMounted(async () => {
  if (userStore.user) {
    await fetchEntries();
  }
});

async function logout() {
  await userStore.logout();
  router.push('/login');
}

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
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  position: relative;
}

.home::before {
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

.top-nav {
  position: fixed;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  z-index: 100;
}

.create-btn {
  background: rgba(255, 152, 0, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
  text-decoration: none;
}

.create-btn:hover {
  background: rgba(230, 137, 0, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
}

.logout-btn {
  background: rgba(244, 67, 54, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(244, 67, 54, 0.3);
}

.logout-btn:hover {
  background: rgba(211, 47, 47, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.4);
}

.btn-icon,
.logout-icon {
  font-size: 1.1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  margin-top: 4rem;
}

.cat-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -2px;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-weight: 300;
}

.user-section {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}

.welcome-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 1.5rem;
  color: white;
  margin: 0;
  font-weight: 400;
}

.username {
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.entries-section {
  margin-top: 2rem;
}

.entries-title {
  text-align: left;
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
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
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
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

.mood-badge {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
  text-transform: capitalize;
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

.auth-section {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.auth-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.auth-header {
  margin-bottom: 2rem;
}

.paw-prints {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.auth-header h2 {
  font-size: 2rem;
  color: white;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.auth-header p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1.1rem;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.login-btn {
  background: rgba(76, 175, 80, 0.2);
  color: white;
  border: 2px solid #4caf50;
}

.login-btn:hover {
  background: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.4);
}

.register-btn {
  background: rgba(255, 152, 0, 0.2);
  color: white;
  border: 2px solid #ff9800;
}

.register-btn:hover {
  background: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 152, 0, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .top-nav {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }

  .create-btn,
  .logout-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .title {
    font-size: 2.5rem;
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

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-buttons {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }

  .welcome-card,
  .entry-card,
  .auth-card {
    padding: 1.5rem 1rem;
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
