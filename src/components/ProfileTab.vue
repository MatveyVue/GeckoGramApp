<template>
  <div class="profile">
    <!-- Аватар и имя -->
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <img 
          :src="defaultAvatar" 
          class="profile-avatar"
          @error="handleImageError"
        >
        <span class="online-badge"></span>
      </div>
      
      <!-- Редактирование имени (оно же username) -->
      <div class="name-edit-container">
        <div v-if="!isEditingName" class="profile-name-wrapper">
          <h1 class="profile-name">{{ displayName }}</h1>
          <button @click="startEditing" class="edit-name-btn" title="Редактировать имя">
            ✏️
          </button>
        </div>
        
        <div v-else class="name-edit-form">
          <input 
            ref="nameInput"
            v-model="editedName"
            type="text"
            class="name-input"
            maxlength="30"
            placeholder="Введите имя"
            @keyup.enter="saveName"
            @keyup.esc="cancelEditing"
          >
          <div class="name-edit-actions">
            <button @click="saveName" class="save-btn" :disabled="isSaving">✓</button>
            <button @click="cancelEditing" class="cancel-btn" :disabled="isSaving">✗</button>
          </div>
        </div>
        <div v-if="saveError" class="save-error-message">{{ saveError }}</div>
        <div v-if="saveSuccess" class="save-success-message">Имя сохранено!</div>
      </div>
      
      <p class="profile-phone">+{{ formatPhone(currentUserPhone) }}</p>
      
      <!-- Отображаем то же имя как username -->
      <p class="profile-username">@{{ displayName }}</p>
      
      <p class="profile-bio">GeckoGram user 🦎</p>
    </div>

    <!-- Информация -->
    <div class="info-section">
      <div class="info-item">
        <span class="info-icon">📱</span>
        <div class="info-content">
          <span class="info-label">Phone</span>
          <span class="info-value">+{{ formatPhone(currentUserPhone) }}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🦎</span>
        <div class="info-content">
          <span class="info-label">Username</span>
          <span class="info-value">@{{ displayName }}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🔒</span>
        <div class="info-content">
          <span class="info-label">Password</span>
          <span class="info-value">••••••••</span>
        </div>
        <button @click="showPasswordModal = true" class="edit-password-btn" title="Изменить пароль">
          ✏️
        </button>
      </div>
      <div class="info-item">
        <span class="info-icon">📅</span>
        <div class="info-content">
          <span class="info-label">Member since</span>
          <span class="info-value">2025</span>
        </div>
      </div>
    </div>
    
    <!-- Кнопка выхода -->
    <div class="logout-section">
      <button @click="logout" class="logout-full-btn">
        🚪 Выйти из аккаунта
      </button>
    </div>

    <!-- Модалка смены пароля -->
    <div v-if="showPasswordModal" class="password-modal" @click.self="closePasswordModal">
      <div class="password-modal-content">
        <button class="close-modal" @click="closePasswordModal">×</button>
        <h3 class="password-modal-title">🔒 Изменение пароля</h3>
        
        <div class="password-form">
          <div class="password-field">
            <label>Текущий пароль</label>
            <div class="password-input-wrapper">
              <input 
                :type="showCurrentPassword ? 'text' : 'password'" 
                v-model="currentPassword"
                placeholder="Введите текущий пароль"
                class="password-input"
              >
              <button @click="showCurrentPassword = !showCurrentPassword" class="password-toggle">
                {{ showCurrentPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>
          
          <div class="password-field">
            <label>Новый пароль</label>
            <div class="password-input-wrapper">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                v-model="newPassword"
                placeholder="Введите новый пароль"
                class="password-input"
                @input="checkPasswordStrength"
              >
              <button @click="showNewPassword = !showNewPassword" class="password-toggle">
                {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <!-- Индикатор сложности пароля -->
            <div class="password-strength" v-if="newPassword">
              <div class="strength-bar" :class="strengthClass"></div>
              <span class="strength-text">{{ strengthText }}</span>
            </div>
          </div>
          
          <div class="password-field">
            <label>Подтверждение пароля</label>
            <div class="password-input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword"
                placeholder="Подтвердите новый пароль"
                class="password-input"
              >
              <button @click="showConfirmPassword = !showConfirmPassword" class="password-toggle">
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div v-if="confirmPassword && newPassword !== confirmPassword" class="password-error">
              Пароли не совпадают
            </div>
          </div>
          
          <div v-if="passwordError" class="password-global-error">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="password-global-success">{{ passwordSuccess }}</div>
          
          <div class="password-actions">
            <button @click="changePassword" class="password-save-btn" :disabled="isChangingPassword">
              {{ isChangingPassword ? '⏳' : 'Сохранить пароль' }}
            </button>
            <button @click="closePasswordModal" class="password-cancel-btn">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>

    <p style="color: white;">.</p>
    <p style="color: white;">.</p>
    <p style="color: white;">.</p>
    <p style="color: white;">.</p>

    <!-- Навигация -->
    <div class="nav-bar">
      <button @click="$emit('go-to-main')" class="nav-btn">🏠</button>
      <button @click="$emit('go-to-main')" class="nav-btn">💬</button>
      <button class="nav-btn active">👤</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase.js';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';

export default {
  name: 'ProfileTab',
  props: {
    currentUserPhone: String,
    currentUserName: String,
    currentUserCap: String,
    currentUserSticker: String
  },
  emits: ['update-user', 'logout', 'go-to-main'],
  data() {
    return {
      defaultAvatar: 'https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png',
      
      // Для имени
      isEditingName: false,
      editedName: '',
      displayName: this.currentUserName || 'User',
      isSaving: false,
      saveError: null,
      saveSuccess: false,
      
      // Для пароля
      showPasswordModal: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isChangingPassword: false,
      passwordError: null,
      passwordSuccess: null,
      
      // Показ/скрытие паролей
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      
      successTimeout: null,
      userId: null
    };
  },
  watch: {
    currentUserName: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.displayName = newVal;
        }
      }
    }
  },
  computed: {
    // Оценка сложности пароля
    passwordStrength() {
      if (!this.newPassword) return 0;
      
      let strength = 0;
      if (this.newPassword.length >= 8) strength += 25;
      if (this.newPassword.length >= 12) strength += 25;
      if (/[A-Z]/.test(this.newPassword)) strength += 15;
      if (/[0-9]/.test(this.newPassword)) strength += 15;
      if (/[^A-Za-z0-9]/.test(this.newPassword)) strength += 20;
      
      return Math.min(100, strength);
    },
    
    strengthClass() {
      const strength = this.passwordStrength;
      if (strength < 30) return 'weak';
      if (strength < 60) return 'medium';
      if (strength < 80) return 'good';
      return 'strong';
    },
    
    strengthText() {
      const strength = this.passwordStrength;
      if (strength < 30) return 'Слабый пароль';
      if (strength < 60) return 'Средний пароль';
      if (strength < 80) return 'Хороший пароль';
      return 'Надежный пароль';
    }
  },
  async mounted() {
    this.userId = localStorage.getItem('userId');
    this.loadSavedData();
    await this.loadUserData();
  },
  beforeUnmount() {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  },
  methods: {
    formatPhone(phone) {
      if (!phone) return '';
      const clean = phone.replace(/\D/g, '');
      if (clean.length >= 9) {
        return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
      }
      return phone;
    },
    
    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },
    
    logout() {
      if (confirm('Выйти из аккаунта?')) {
        localStorage.removeItem('userDisplayName');
        localStorage.removeItem('userId');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userName');
        this.$emit('logout');
      }
    },
    
    loadSavedData() {
      try {
        const savedName = localStorage.getItem('userDisplayName');
        if (savedName) {
          this.displayName = savedName;
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    },
    
    // Загрузка данных из Firebase
    async loadUserData() {
      if (!this.currentUserPhone) return;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', this.currentUserPhone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          this.userId = userDoc.id;
          localStorage.setItem('userId', userDoc.id);
          
          if (userData.name) {
            this.displayName = userData.name;
            localStorage.setItem('userDisplayName', userData.name);
          }
          
          console.log('Данные пользователя загружены:', userData);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    },
    
    // ========== МЕТОДЫ ДЛЯ ИМЕНИ ==========
    startEditing() {
      this.editedName = this.displayName;
      this.isEditingName = true;
      this.saveError = null;
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
          this.$refs.nameInput.select();
        }
      });
    },
    
    async saveName() {
      if (!this.editedName || !this.editedName.trim()) {
        this.saveError = 'Имя не может быть пустым';
        return;
      }
      
      const newName = this.editedName.trim();
      
      if (newName.length < 2) {
        this.saveError = 'Имя должно содержать минимум 2 символа';
        return;
      }
      
      if (newName.length > 30) {
        this.saveError = 'Имя не может быть длиннее 30 символов';
        return;
      }
      
      const nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!nameRegex.test(newName)) {
        this.saveError = 'Имя может содержать только буквы, цифры и _';
        return;
      }
      
      this.isSaving = true;
      this.saveError = null;
      
      try {
        const isAvailable = await this.checkNameAvailability(newName);
        
        if (!isAvailable) {
          this.saveError = 'Это имя уже занято';
          this.isSaving = false;
          return;
        }
        
        const saved = await this.saveNameToDatabase(newName);
        
        if (saved) {
          this.displayName = newName;
          
          this.$emit('update-user', {
            name: newName,
            phone: this.currentUserPhone
          });
          
          try {
            localStorage.setItem('userDisplayName', newName);
          } catch (e) {
            console.warn('Ошибка сохранения в localStorage:', e);
          }
          
          this.showSuccess('saveSuccess');
          this.isEditingName = false;
        }
      } catch (error) {
        console.error('Ошибка при сохранении имени:', error);
        this.saveError = 'Не удалось сохранить имя';
      } finally {
        this.isSaving = false;
      }
    },
    
    cancelEditing() {
      this.isEditingName = false;
      this.editedName = this.displayName;
      this.saveError = null;
    },
    
    async checkNameAvailability(name) {
      if (!name) return false;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            if (userData.phone === this.currentUserPhone) {
              return true;
            }
          }
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Ошибка проверки имени:', error);
        return false;
      }
    },
    
    async saveNameToDatabase(newName) {
      if (!this.currentUserPhone) return true;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', this.currentUserPhone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userRef = doc(db, 'users', userDoc.id);
          
          await updateDoc(userRef, {
            name: newName,
            updatedAt: new Date().toISOString()
          });
          
          console.log('Имя сохранено в Firebase:', newName);
          return true;
        }
        return true;
      } catch (error) {
        console.error('Ошибка сохранения имени:', error);
        throw error;
      }
    },
    
    // ========== МЕТОДЫ ДЛЯ ПАРОЛЯ ==========
    checkPasswordStrength() {
      // Автоматически обновляет computed свойства
    },
    
    closePasswordModal() {
      this.showPasswordModal = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordError = null;
      this.passwordSuccess = null;
    },
    
    async changePassword() {
      // Валидация
      if (!this.currentPassword) {
        this.passwordError = 'Введите текущий пароль';
        return;
      }
      
      if (!this.newPassword) {
        this.passwordError = 'Введите новый пароль';
        return;
      }
      
      if (this.newPassword.length < 6) {
        this.passwordError = 'Пароль должен быть не менее 6 символов';
        return;
      }
      
      if (this.newPassword !== this.confirmPassword) {
        this.passwordError = 'Пароли не совпадают';
        return;
      }
      
      if (this.passwordStrength < 30) {
        if (!confirm('Пароль слишком простой. Продолжить?')) {
          return;
        }
      }
      
      this.isChangingPassword = true;
      this.passwordError = null;
      this.passwordSuccess = null;
      
      try {
        // Ищем пользователя в Firebase
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', this.currentUserPhone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          // Проверяем текущий пароль (если он есть в БД)
          if (userData.password && userData.password !== this.currentPassword) {
            this.passwordError = 'Неверный текущий пароль';
            this.isChangingPassword = false;
            return;
          }
          
          // Обновляем пароль
          const userRef = doc(db, 'users', userDoc.id);
          await updateDoc(userRef, {
            password: this.newPassword,
            updatedAt: new Date().toISOString()
          });
          
          this.passwordSuccess = 'Пароль успешно изменен!';
          
          setTimeout(() => {
            this.closePasswordModal();
          }, 2000);
        } else {
          this.passwordError = 'Пользователь не найден';
        }
      } catch (error) {
        console.error('Ошибка смены пароля:', error);
        this.passwordError = 'Не удалось изменить пароль';
      } finally {
        this.isChangingPassword = false;
      }
    },
    
    showSuccess(type) {
      this[type] = true;
      if (this.successTimeout) clearTimeout(this.successTimeout);
      this.successTimeout = setTimeout(() => {
        this.saveSuccess = false;
      }, 3000);
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Аватар секция */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 24px;
  background: linear-gradient(135deg, #0a7c3a 0%, #0e8a44 100%);
  color: white;
  min-height: 350px;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 60px;
}

.online-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #4ade80;
  border: 3px solid white;
  border-radius: 50%;
}

/* Контейнер для редактирования имени */
.name-edit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 4px 0;
  position: relative;
}

.profile-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.edit-name-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;
  padding: 0;
}

.edit-name-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  border-color: white;
}

/* Форма редактирования имени */
.name-edit-form {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 4px 4px 4px 12px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 280px;
  width: 100%;
}

.name-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  padding: 6px 0;
  background: transparent;
  color: #333;
}

.name-input::placeholder {
  color: #999;
}

.name-edit-actions {
  display: flex;
  gap: 4px;
}

.save-btn, .cancel-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.save-btn {
  background: #0a7c3a;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0e8a44;
  transform: scale(1.1);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: #ff4757;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #ff6b81;
  transform: scale(1.1);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-error-message {
  color: #ff6b6b;
  font-size: 11px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
}

.save-success-message {
  color: #4ade80;
  font-size: 11px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  animation: fadeInOut 3s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

.profile-phone {
  font-size: 16px;
  color: rgba(255,255,255,0.9);
  margin: 8px 0 4px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.profile-username {
  font-size: 15px;
  color: rgba(255,255,255,0.8);
  margin: 4px 0;
}

.profile-bio {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 12px 0 4px;
  padding: 8px 24px;
  background: rgba(255,255,255,0.15);
  border-radius: 30px;
}

/* Информация */
.info-section {
  background: white;
  margin: 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 22px;
  margin-right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  border-radius: 10px;
  color: #0a7c3a;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 2px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #1c1c1e;
}

.edit-password-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 10px;
  flex-shrink: 0;
}

.edit-password-btn:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

/* Модалка пароля */
.password-modal {
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

.password-modal-content {
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

.password-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-field label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.password-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.password-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px;
  font-size: 14px;
  background: transparent;
}

.password-toggle {
  background: none;
  border: none;
  padding: 0 12px;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.password-toggle:hover {
  color: #333;
}

/* Индикатор сложности пароля */
.password-strength {
  margin-top: 6px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.strength-bar.weak {
  width: 25%;
  background: #ff4757;
}

.strength-bar.medium {
  width: 50%;
  background: #ffa502;
}

.strength-bar.good {
  width: 75%;
  background: #4CAF50;
}

.strength-bar.strong {
  width: 100%;
  background: #0a7c3a;
}

.strength-text {
  font-size: 11px;
  color: #666;
}

.password-error {
  color: #ff4757;
  font-size: 11px;
  margin-top: 2px;
}

.password-global-error {
  background: #ffebee;
  color: #ff4757;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.password-global-success {
  background: #e8f5e9;
  color: #0a7c3a;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.password-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.password-save-btn {
  flex: 2;
  padding: 12px;
  background: #0a7c3a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.password-save-btn:hover:not(:disabled) {
  background: #0e8a44;
  transform: translateY(-2px);
}

.password-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.password-cancel-btn:hover {
  background: #e0e0e0;
}

/* Секция выхода */
.logout-section {
  display: flex;
  justify-content: center;
  margin: 24px 16px;
}

.logout-full-btn {
  width: 100%;
  max-width: 300px;
  padding: 14px 24px;
  background: #fff0f0;
  border: 1px solid #ffcdd2;
  border-radius: 30px;
  color: #ff4757;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-full-btn:hover {
  background: #ffe0e0;
  border-color: #ff8a8a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
}

/* Анимация */
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

/* Медиа запросы */
@media (max-width: 640px) {
  .profile { max-width: 100%; }
  .avatar-section { padding: 28px 16px 20px; }
  .profile-avatar { width: 110px; height: 110px; }
  .profile-name { font-size: 24px; }
  .nav-bar { padding: 8px 16px; }
  .nav-btn { font-size: 22px; padding: 6px 20px; }
}

@media (max-width: 480px) {
  .avatar-section { padding: 24px 16px 16px; }
  .profile-avatar { width: 100px; height: 100px; }
  .profile-name { font-size: 22px; }
  .profile-phone { font-size: 14px; }
  .profile-username { font-size: 13px; }
  .profile-bio { font-size: 13px; }
  .name-edit-form { max-width: 240px; }
  .name-input { font-size: 14px; }
  .save-btn, .cancel-btn, .edit-name-btn { width: 28px; height: 28px; }
  .info-section { margin: 12px; padding: 12px; }
  .info-icon { width: 28px; height: 28px; font-size: 20px; }
  .password-modal-content { padding: 36px 20px 20px; }
  .password-actions { flex-direction: column; }
}

@media (max-width: 360px) {
  .profile-avatar { width: 90px; height: 90px; }
  .profile-name { font-size: 20px; }
  .name-edit-form { max-width: 200px; }
  .nav-btn { font-size: 20px; padding: 5px 16px; }
}

/* Исправление для iPhone */
@supports (padding: max(0px)) {
  .nav-bar {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>
