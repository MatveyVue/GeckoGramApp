<template>
  <div class="profile">
    <!-- Аватар и имя -->
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <img 
          :src="currentUserCap || 'https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png'" 
          class="profile-avatar"
          @error="handleImageError"
        >
        <span class="online-badge"></span>
      </div>
      <h1 class="profile-name">{{ currentUserName }}</h1>
      <p class="profile-phone">+{{ formatPhone(currentUserPhone) }}</p>
      <p class="profile-username">@{{ currentUserName }}</p>
      <p class="profile-bio">GeckoGram user 🦎</p>
    </div>

    <!-- Медиа раздел -->
    <div class="media-section">
      <div class="media-header">
        <span class="media-title">📸 Gifts & Stickers</span>
      </div>
      <div class="media-grid">
        <div class="media-item">
          <img :src="currentUserCap" class="media-image">
          <span class="media-label">🎁 Gift</span>
        </div>
        <div class="media-item">
          <img :src="currentUserSticker || currentUserCap" class="media-image">
          <span class="media-label">🎨 Sticker</span>
        </div>
      </div>
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
          <span class="info-value">@{{ currentUserName }}</span>
        </div>
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

    <p style="color: white;">.</p>
    <p style="color: white;">.</p>
    <p style="color: white;">.</p>
    <p style="color: white;">.</p>

    <!-- Навигация -->
    <div class="nav-bar">
      <button class="nav-btn">🏠</button>
      <button @click="$emit('go-to-main')" class="nav-btn">💬</button>
      <button class="nav-btn active">👤</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileTab',
  props: {
    currentUserPhone: String,
    currentUserName: String,
    currentUserCap: String,
    currentUserSticker: String
  },
  methods: {
    formatPhone(phone) {
      if (!phone) return '';
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)}`;
    },
    handleImageError(e) {
      e.target.src = 'https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png';
    },
    logout() {
      if (confirm('Выйти из аккаунта?')) {
        this.$emit('logout');
      }
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

/* Хедер с кнопкой выхода */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #0a7c3a;
}

.logout-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 44px;
  height: 44px;
}

.logout-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  transform: scale(1.1);
  color: #ff4757;
}

.back-btn, .settings-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #0a7c3a;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Аватар секция */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 24px;
  background: linear-gradient(135deg, #0a7c3a 0%, #0e8a44 100%);
  color: white;
  height: 50%;
  max-height: 450px;
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

.profile-name {
  font-size: 26px;
  font-weight: 700;
  margin: 6px 0 4px;
  color: white;
}

.profile-phone {
  font-size: 16px;
  color: rgba(255,255,255,0.9);
  margin: 4px 0;
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

/* Медиа секция */
.media-section {
  background: white;
  margin: 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.media-title {
  font-size: 16px;
  font-weight: 600;
  color: #0a7c3a;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.media-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10,124,58,0.1);
}

.media-image {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  object-fit: cover;
}

.media-label {
  font-size: 13px;
  font-weight: 500;
  color: #0a7c3a;
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

.logout-full-btn:active {
  transform: translateY(0);
}

/* Скрываем старые стили */
.stats, .action-buttons, .profile-info, .footer, .gifts-container, .stickers-container {
  display: none;
}

/* Адаптивность для разных разрешений */
@media (max-width: 640px) {
  .profile {
    max-width: 100%;
  }
  
  .avatar-section {
    padding: 28px 16px 20px;
  }
  
  .profile-avatar {
    width: 110px;
    height: 110px;
    border-width: 3px;
  }
  
  .online-badge {
    width: 14px;
    height: 14px;
    bottom: 6px;
    right: 6px;
    border-width: 2px;
  }
  
  .profile-name {
    font-size: 24px;
  }
  
  .profile-phone {
    font-size: 15px;
  }
  
  .media-section {
    margin: 12px;
    padding: 14px;
  }
  
  .media-image {
    width: 65px;
    height: 65px;
  }
  
  .info-section {
    margin: 12px;
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 10px 16px;
  }
  
  .back-btn, .settings-btn, .logout-btn {
    font-size: 22px;
    padding: 6px;
  }
  
  .header-title {
    font-size: 17px;
  }
  
  .avatar-section {
    padding: 24px 16px 16px;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
  }
  
  .online-badge {
    width: 12px;
    height: 12px;
  }
  
  .profile-name {
    font-size: 22px;
  }
  
  .profile-phone {
    font-size: 14px;
  }
  
  .profile-username {
    font-size: 13px;
  }
  
  .profile-bio {
    font-size: 13px;
    padding: 6px 20px;
  }
  
  .media-section {
    margin: 10px;
    padding: 12px;
  }
  
  .media-title {
    font-size: 15px;
  }
  
  .media-grid {
    gap: 8px;
  }
  
  .media-item {
    padding: 12px;
  }
  
  .media-image {
    width: 60px;
    height: 60px;
    border-radius: 12px;
  }
  
  .media-label {
    font-size: 12px;
  }
  
  .info-section {
    margin: 10px;
    padding: 12px;
  }
  
  .info-item {
    padding: 10px 0;
  }
  
  .info-icon {
    font-size: 20px;
    width: 28px;
    height: 28px;
    margin-right: 12px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 14px;
  }
  
  .nav-bar {
    padding: 8px 16px;
  }
  
  .nav-btn {
    font-size: 22px;
    padding: 6px 20px;
  }
  
  .logout-full-btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .profile-avatar {
    width: 90px;
    height: 90px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-phone {
    font-size: 13px;
  }
  
  .media-image {
    width: 50px;
    height: 50px;
  }
  
  .media-item {
    padding: 10px;
  }
  
  .info-icon {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }
  
  .nav-btn {
    font-size: 20px;
    padding: 5px 16px;
  }
}
</style>
