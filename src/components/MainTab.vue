<template>
  <div class="main">
    <!-- Шапка профиля -->
    <div class="profile-header">
      <div class="user-info">
        <img :src="defaultAvatar" class="user-avatar" alt="avatar">
        <div class="user-details">
          <h2 class="user-name">{{ currentUserName }}</h2>
          <p class="user-phone">{{ formatPhone(currentUserPhone) }}</p>
        </div>
      </div>
    </div>

    <!-- Форма поста с фото и рисовалкой -->
    <div class="post-form">
      <div class="post-form-header">
        <img :src="defaultAvatar" class="post-avatar" alt="avatar">
        <span class="post-author">{{ currentUserName }}</span>
      </div>
      
      <!-- Текст поста -->
      <textarea 
        v-model="newPost" 
        placeholder="Что у вас нового?"
        rows="3"
        class="post-input"
        @keyup.ctrl.enter="addPost"
      ></textarea>
      
      <!-- Канвас для рисования -->
      <div v-if="showCanvas" class="canvas-container">
        <div class="canvas-toolbar">
          <button @click="setColor('#000000')" class="color-btn" style="background: black;"></button>
          <button @click="setColor('#ff4757')" class="color-btn" style="background: #ff4757;"></button>
          <button @click="setColor('#4CAF50')" class="color-btn" style="background: #4CAF50;"></button>
          <button @click="setColor('#2196F3')" class="color-btn" style="background: #2196F3;"></button>
          <button @click="setColor('#FFC107')" class="color-btn" style="background: #FFC107;"></button>
          <button @click="setColor('#9C27B0')" class="color-btn" style="background: #9C27B0;"></button>
          <input type="range" v-model="brushSize" min="1" max="20" class="brush-size">
          <span class="brush-size-label">{{ brushSize }}px</span>
          <button @click="clearCanvas" class="canvas-btn">🗑️</button>
          <button @click="saveDrawing" class="canvas-btn">✅ Сохранить</button>
          <button @click="showCanvas = false" class="canvas-btn">✖️ Закрыть</button>
        </div>
        <canvas 
          ref="drawingCanvas"
          width="500"
          height="300"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawingTouch"
          @touchmove.prevent="drawTouch"
          @touchend.prevent="stopDrawing"
          @touchcancel.prevent="stopDrawing"
          class="drawing-canvas"
        ></canvas>
      </div>
      
      <!-- Предпросмотр фото/рисунка -->
      <div v-if="imagePreview" class="image-preview-container">
        <img :src="imagePreview" class="image-preview">
        <button class="remove-image" @click="removeImage">×</button>
      </div>
      
      <div class="post-actions">
        <div class="post-media-actions">
          <!-- Кнопка загрузки фото -->
          <label class="media-btn">
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageUpload" 
              style="display: none;"
            >
            <span class="media-icon">📷</span>
            <span class="media-text">Фото</span>
          </label>
          
          <!-- Кнопка рисования -->
          <button @click="openCanvas" class="media-btn">
            <span class="media-icon">🎨</span>
            <span class="media-text">Рисовать</span>
          </button>
          
          <span class="char-counter">{{ newPost.length }}/200</span>
        </div>
        <button 
          @click="addPost" 
          :disabled="!newPost.trim() && !imageFile && !drawingImage || isPosting"
          class="post-btn"
        >
          {{ isPosting ? '⏳' : '📤 Опубликовать' }}
        </button>
      </div>
    </div>

    <!-- Лента постов -->
    <div class="posts-feed" @scroll="handleScroll" ref="postsContainer">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="posts.length === 0" class="empty">
        <span class="empty-icon">💬</span>
        <p>Нет постов</p>
        <small>Напишите первым!</small>
      </div>

      <div v-else v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-user" @click="viewProfile(post.userId)">
            <img :src="defaultAvatar" class="post-user-avatar" alt="avatar" loading="lazy">
            <div class="post-user-info">
              <span class="post-user-name">{{ post.userName || 'Пользователь' }}</span>
              <span class="post-time">{{ formatTime(post.time) }}</span>
            </div>
          </div>
          <button 
            v-if="post.userId === currentUserPhone" 
            @click="deletePost(post.id)"
            class="delete-btn"
            title="Удалить"
          >
            🗑️
          </button>
        </div>

        <div class="post-content">
          <p v-if="post.text && post.text !== ' '" class="post-text">{{ post.text }}</p>
          <div v-if="post.image" class="post-image-wrapper">
            <img :src="post.image" class="post-image" loading="lazy" @click="viewImage(post.image)">
          </div>
        </div>

        <div class="post-footer">
          <button @click="likePost(post.id)" class="like-btn" :class="{ 'liked': post.liked }">
            <span class="like-icon">❤️</span>
            <span class="like-count">{{ post.likesCount || 0 }}</span>
          </button>
        </div>
      </div>
      
      <!-- Индикатор загрузки -->
      <div v-if="loadingMore" class="loading-more">
        <div class="spinner small"></div>
      </div>
    </div>

    <!-- Модалка профиля -->
    <div v-if="showProfileModal" class="profile-modal" @click.self="showProfileModal = false">
      <div class="profile-modal-content">
        <button class="close-modal" @click="showProfileModal = false">×</button>
        
        <div v-if="selectedUser" class="selected-profile">
          <div class="selected-profile-header">
            <img :src="defaultAvatar" class="selected-profile-avatar" loading="lazy">
            <h2 class="selected-profile-name">{{ selectedUser.name || 'Пользователь' }}</h2>
            <p class="selected-profile-phone">{{ formatPhone(selectedUser.phone) }}</p>
            <p class="selected-profile-username">@{{ selectedUser.username || selectedUser.name || 'user' }}</p>
          </div>

          <div class="selected-profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ selectedUser.posts || 0 }}</span>
              <span class="stat-label">Постов</span>
            </div>
          </div>

          <div class="selected-profile-bio" v-if="selectedUser.bio">
            {{ selectedUser.bio }}
          </div>
          <div class="selected-profile-bio" v-else>
            Пользователь GeckoGram 🦎
          </div>
        </div>
      </div>
    </div>

    <!-- Просмотр изображения -->
    <div v-if="showImageViewer" class="image-viewer" @click="showImageViewer = false">
      <img :src="selectedImage" class="viewer-image" loading="lazy">
      <button class="close-viewer">×</button>
    </div>

<p style="color: white;">.</p>
<p style="color: white;">.</p>
<p style="color: white;">.</p>

    <!-- Навигация -->
    <div class="nav-bar">
      <button class="nav-btn">🏠</button>
      <button class="nav-btn active">💬</button>
      <button @click="$emit('go-to-profile')" class="nav-btn">👤</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase.js';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  startAfter
} from 'firebase/firestore';

// Кеш для пользователей
const userCache = new Map();
const POSTS_LIMIT = 20;
let lastVisible = null;
let loadingMore = false;
let hasMore = true;

export default {
  name: 'MainTab',
  props: {
    currentUserPhone: {
      type: String,
      default: ''
    },
    currentUserName: {
      type: String,
      default: ''
    }
  },
  emits: ['go-to-profile', 'restore-session'], // Добавлено событие restore-session
  data() {
    return {
      newPost: '',
      posts: [],
      loading: true,
      loadingMore: false,
      showImageViewer: false,
      selectedImage: '',
      showProfileModal: false,
      selectedUser: null,
      defaultAvatar: `https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png`,
      imageFile: null,
      imagePreview: '',
      showCanvas: false,
      drawing: false,
      brushSize: 5,
      currentColor: '#000000',
      drawingImage: null,
      canvasContext: null,
      isPosting: false,
      likeDebounce: new Map(),
      unsubscribe: null,
      sessionChecked: false
    }
  },
  mounted() {
    console.log('MainTab mounted with props:', {
      phone: this.currentUserPhone,
      name: this.currentUserName
    });
    
    // Проверяем сессию при загрузке
    this.checkSession();
    this.loadPosts();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.likeDebounce.clear();
  },
  methods: {
    // Проверка сессии
    checkSession() {
      const savedPhone = localStorage.getItem('userPhone');
      const savedName = localStorage.getItem('userName');
      const savedId = localStorage.getItem('userId');
      
      console.log('Проверка сессии:', { savedPhone, savedName, savedId });
      console.log('Текущие props:', { 
        phone: this.currentUserPhone, 
        name: this.currentUserName 
      });
      
      // Если есть сохраненная сессия, но нет props - эмитим событие для восстановления
      if (savedPhone && savedName && !this.currentUserPhone) {
        console.log('⚠️ Сессия есть в localStorage, но нет в props - восстанавливаем');
        this.$emit('restore-session', {
          phone: savedPhone,
          name: savedName,
          id: savedId
        });
      } else if (this.currentUserPhone) {
        // Если есть props, но нет в localStorage - сохраняем
        console.log('✅ Сохраняем сессию в localStorage');
        localStorage.setItem('userPhone', this.currentUserPhone);
        localStorage.setItem('userName', this.currentUserName);
      }
      
      this.sessionChecked = true;
    },

    // Загрузка постов
    loadPosts() {
      this.loading = true;
      
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('time', 'desc'), limit(POSTS_LIMIT));
      
      this.unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          this.loading = false;
          return;
        }
        
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        hasMore = snapshot.docs.length === POSTS_LIMIT;
        
        const userIds = [...new Set(snapshot.docs.map(doc => doc.data().userId))];
        await this.loadUsersData(userIds);
        
        this.posts = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const user = userCache.get(data.userId) || {};
          
          return {
            id: docSnap.id,
            ...data,
            userName: user.name || `User_${data.userId?.slice(-4) || '??'}`,
            liked: data.likes?.includes(this.currentUserPhone) || false,
            likesCount: data.likes?.length || 0
          };
        });
        
        this.loading = false;
      });
    },

    // Загрузка данных пользователей
    async loadUsersData(userIds) {
      const uniqueIds = [...new Set(userIds.filter(id => id && !userCache.has(id)))];
      
      if (uniqueIds.length === 0) return;
      
      const batches = [];
      for (let i = 0; i < uniqueIds.length; i += 10) {
        const batch = uniqueIds.slice(i, i + 10);
        const q = query(collection(db, 'users'), where('phone', 'in', batch));
        batches.push(getDocs(q));
      }
      
      try {
        const results = await Promise.all(batches);
        results.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            const userData = doc.data();
            if (userData.phone) {
              userCache.set(userData.phone, {
                name: userData.name,
                username: userData.username,
                bio: userData.bio
              });
            }
          });
        });
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    },

    // Загрузка следующих постов
    async loadMorePosts() {
      if (loadingMore || !hasMore || !lastVisible) return;
      
      loadingMore = true;
      this.loadingMore = true;
      
      try {
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef, 
          orderBy('time', 'desc'), 
          startAfter(lastVisible),
          limit(POSTS_LIMIT)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          lastVisible = snapshot.docs[snapshot.docs.length - 1];
          hasMore = snapshot.docs.length === POSTS_LIMIT;
          
          const userIds = [...new Set(snapshot.docs.map(doc => doc.data().userId))];
          await this.loadUsersData(userIds);
          
          const newPosts = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const user = userCache.get(data.userId) || {};
            
            return {
              id: docSnap.id,
              ...data,
              userName: user.name || `User_${data.userId?.slice(-4) || '??'}`,
              liked: data.likes?.includes(this.currentUserPhone) || false,
              likesCount: data.likes?.length || 0
            };
          });
          
          this.posts = [...this.posts, ...newPosts];
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
      } finally {
        loadingMore = false;
        this.loadingMore = false;
      }
    },

    // Рисовалка
    openCanvas() {
      this.showCanvas = true;
      this.imageFile = null;
      this.imagePreview = '';
      this.$nextTick(() => {
        this.initCanvas();
      });
    },

    initCanvas() {
      const canvas = this.$refs.drawingCanvas;
      if (canvas) {
        this.canvasContext = canvas.getContext('2d');
        this.canvasContext.fillStyle = 'white';
        this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        this.canvasContext.lineCap = 'round';
        this.canvasContext.lineJoin = 'round';
        this.canvasContext.lineWidth = this.brushSize;
      }
    },

    setColor(color) {
      this.currentColor = color;
    },

    startDrawing(e) {
      this.drawing = true;
      const ctx = this.canvasContext;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.brushSize;
    },

    draw(e) {
      if (!this.drawing) return;
      const ctx = this.canvasContext;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    },

    startDrawingTouch(e) {
      e.preventDefault();
      this.drawing = true;
      
      const canvas = this.$refs.drawingCanvas;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      const ctx = this.canvasContext;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.brushSize;
    },

    drawTouch(e) {
      e.preventDefault();
      if (!this.drawing) return;
      
      const canvas = this.$refs.drawingCanvas;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      const ctx = this.canvasContext;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    },

    stopDrawing() {
      this.drawing = false;
    },

    clearCanvas() {
      const canvas = this.$refs.drawingCanvas;
      const ctx = this.canvasContext;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.drawingImage = null;
    },

    saveDrawing() {
      const canvas = this.$refs.drawingCanvas;
      this.drawingImage = canvas.toDataURL('image/png');
      this.imagePreview = this.drawingImage;
      this.imageFile = 'drawing';
      this.showCanvas = false;
    },

    // Загрузка фото
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Размер файла не должен превышать 2MB');
        return;
      }
      
      this.imageFile = file;
      this.showCanvas = false;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.imageFile = null;
      this.imagePreview = '';
      this.drawingImage = null;
    },

    // Добавление поста
    async addPost() {
      if (this.isPosting) return;
      if (!this.newPost.trim() && !this.imageFile && !this.drawingImage) {
        alert('Напишите текст или добавьте фото/рисунок');
        return;
      }
      
      this.isPosting = true;
      
      try {
        let imageUrl = '';
        
        if (this.drawingImage) {
          imageUrl = this.drawingImage;
        } else if (this.imageFile && this.imageFile !== 'drawing') {
          imageUrl = await this.fileToBase64(this.imageFile);
        }
        
        await addDoc(collection(db, 'posts'), {
          userId: this.currentUserPhone,
          text: this.newPost.trim() || ' ',
          image: imageUrl,
          time: Date.now(),
          likes: []
        });
        
        this.newPost = '';
        this.removeImage();
        this.drawingImage = null;
        
      } catch (error) {
        console.error('Ошибка добавления поста:', error);
        alert('Не удалось опубликовать пост');
      } finally {
        this.isPosting = false;
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    },

    // Лайк с дебаунсом
    likePost(postId) {
      if (this.likeDebounce.has(postId)) return;
      
      this.likeDebounce.set(postId, setTimeout(async () => {
        try {
          const postRef = doc(db, 'posts', postId);
          const post = this.posts.find(p => p.id === postId);
          
          if (post) {
            if (post.liked) {
              await updateDoc(postRef, {
                likes: arrayRemove(this.currentUserPhone)
              });
            } else {
              await updateDoc(postRef, {
                likes: arrayUnion(this.currentUserPhone)
              });
            }
          }
        } catch (error) {
          console.error('Ошибка лайка:', error);
        } finally {
          this.likeDebounce.delete(postId);
        }
      }, 300));
    },

    // Удаление поста
    async deletePost(postId) {
      if (!confirm('Удалить пост?')) return;
      
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    },

    // Просмотр профиля
    async viewProfile(userId) {
      if (!userId) return;
      
      console.log('Открытие профиля:', userId);
      
      try {
        let userData = userCache.get(userId);
        
        if (!userData) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('phone', '==', userId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            userData = userDoc.data();
            userCache.set(userId, {
              name: userData.name,
              username: userData.username,
              bio: userData.bio
            });
            console.log('Найден пользователь:', userData);
          }
        }
        
        if (userData) {
          const postsCount = this.posts.filter(p => p.userId === userId).length;
          
          this.selectedUser = {
            phone: userId,
            name: userData.name || `User_${userId.slice(-4)}`,
            username: userData.username || userData.name,
            bio: userData.bio,
            posts: postsCount
          };
          
          this.showProfileModal = true;
        } else {
          console.log('Пользователь не найден');
          this.selectedUser = {
            phone: userId,
            name: `User_${userId.slice(-4)}`,
            username: `user_${userId.slice(-4)}`,
            bio: 'Пользователь GeckoGram 🦎',
            posts: this.posts.filter(p => p.userId === userId).length
          };
          this.showProfileModal = true;
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    },

    viewImage(url) {
      this.selectedImage = url;
      this.showImageViewer = true;
    },

    // Форматирование
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const diff = Date.now() - timestamp;
      
      if (diff < 60000) return 'только что';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}м назад`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}ч назад`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}д назад`;
      
      const date = new Date(timestamp);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },

    formatPhone(phone) {
      if (!phone) return '';
      const clean = phone.replace(/\D/g, '');
      if (clean.length >= 9) {
        return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
      }
      return phone;
    },

    // Обработка скролла
    handleScroll(e) {
      const container = e.target;
      if (container.scrollHeight - container.scrollTop - container.clientHeight < 200) {
        this.loadMorePosts();
      }
    }
  }
}
</script>

<style scoped>
/* ========== ОСНОВНЫЕ СТИЛИ ========== */
.main {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  margin-top: 70px;
}

/* ========== ШАПКА ПРОФИЛЯ ========== */
.profile-header {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4CAF50;
}

.user-details {
  text-align: left;
}

.user-name {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.user-phone {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

/* ========== ФОРМА ПОСТА ========== */
.post-form {
  background: white;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.post-form-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.post-input {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  margin-bottom: 12px;
  background: white;
}

.post-input:focus {
  outline: none;
  border-color: #4CAF50;
}

/* ========== КАНВАС ========== */
.canvas-container {
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  background: white;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.color-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.color-btn:hover {
  transform: scale(1.1);
}

.brush-size {
  width: 80px;
  margin: 0 4px;
  flex-shrink: 1;
}

.brush-size-label {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.canvas-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}

.canvas-btn:hover {
  background: #e0e0e0;
}

.drawing-canvas {
  width: 100%;
  height: auto;
  cursor: crosshair;
  background: white;
  aspect-ratio: 500/300;
  touch-action: none; /* Отключает прокрутку при рисовании на телефоне */
}

/* ========== ПРЕДПРОСМОТР ФОТО ========== */
.image-preview-container {
  position: relative;
  margin-bottom: 12px;
}

.image-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.remove-image:hover {
  background: rgba(0,0,0,0.8);
}

/* ========== ДЕЙСТВИЯ С ПОСТОМ ========== */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.post-media-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.media-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.media-btn:hover {
  background: #e0e0e0;
}

.media-icon {
  font-size: 16px;
}

.media-text {
  font-size: 13px;
  color: #666;
}

.char-counter {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.post-btn {
  padding: 8px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.post-btn:hover {
  background: #45a049;
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== КАРТОЧКА ПОСТА ========== */
.post-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.post-user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.post-user-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-time {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.post-text {
  color: #333;
  line-height: 1.5;
  font-size: 15px;
  margin-bottom: 15px;
  word-wrap: break-word;
}

.post-image-wrapper {
  margin-top: 10px;
  border-radius: 15px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 15px;
}

/* ========== ЛАЙКИ ========== */
.post-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.like-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 15px;
  transition: all 0.2s;
  background: none;
}

.like-btn:hover {
  background: #fff0f0;
}

.like-btn.liked {
  color: #ff4757;
}

.like-btn.liked .like-icon {
  animation: likePop 0.3s ease;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 5px;
  border-radius: 5px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #fee;
  color: #ff4757;
}

/* ========== МОДАЛКА ПРОФИЛЯ ========== */
.profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 16px;
  box-sizing: border-box;
}

.profile-modal-content {
  position: relative;
  max-width: 400px;
  width: 90%;
  background: white;
  border-radius: 24px;
  padding: 40px 24px 24px;
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f0f0f0;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-modal:hover {
  background: #e0e0e0;
  color: #333;
}

.selected-profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #4CAF50;
  margin-bottom: 16px;
}

.selected-profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.selected-profile-phone {
  font-size: 15px;
  color: #666;
  margin: 0 0 4px 0;
}

.selected-profile-username {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.selected-profile-stats {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.selected-profile-bio {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
  word-break: break-word;
}

/* ========== ЗАГРУЗКА ========== */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

/* ========== ПРОСМОТР ИЗОБРАЖЕНИЯ ========== */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 16px;
  box-sizing: border-box;
}

.viewer-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  object-fit: contain;
}

.close-viewer {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-viewer:hover {
  background: #f0f0f0;
}

/* ========== АНИМАЦИИ ========== */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes likePop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* ========== МЕДИА ЗАПРОСЫ ДЛЯ ТЕЛЕФОНОВ ========== */
@media (max-width: 600px) {
  .main { padding: 12px; }
  .profile-header { padding: 16px; margin-bottom: 16px; }
  .user-avatar { width: 52px; height: 52px; border-width: 2.5px; }
  .user-name { font-size: 18px; }
  .user-phone { font-size: 13px; }
  .post-form { padding: 16px; margin-bottom: 16px; }
  .post-avatar { width: 36px; height: 36px; }
  .post-author { font-size: 14px; }
  .post-input { padding: 10px; font-size: 14px; margin-bottom: 12px; }
  .post-card { padding: 16px; margin-bottom: 12px; }
  .post-user-avatar { width: 40px; height: 40px; }
  .post-user-name { font-size: 14px; }
  .post-time { font-size: 11px; }
  .post-text { font-size: 14px; margin-bottom: 12px; }
  .nav-bar { padding: 8px 12px; }
  .nav-btn { font-size: 22px; padding: 6px 16px; }
}

@media (max-width: 400px) {
  .post-media-actions { width: 100%; justify-content: space-between; }
  .post-actions { flex-direction: column; align-items: stretch; gap: 10px; }
  .post-btn { width: 100%; padding: 10px 20px; }
  .media-btn { padding: 8px 14px; }
  .canvas-toolbar { gap: 4px; padding: 8px; }
  .color-btn { width: 28px; height: 28px; }
  .brush-size { width: 70px; }
  .canvas-btn { padding: 5px 10px; font-size: 11px; }
  .selected-profile-avatar { width: 90px; height: 90px; }
  .selected-profile-name { font-size: 22px; }
  .profile-modal-content { padding: 36px 20px 20px; }
}

/* Исправление для iPhone с вырезом */
@supports (padding: max(0px)) {
  .nav-bar {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}

/* Удаляем неиспользуемые стили */
.message-btn {
  display: none;
}
</style>
