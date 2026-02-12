<template>
  <div id="app">
    <!-- Экран входа -->
    <LoginTab 
      v-if="activeTab === 'number'"
      @login-success="handleLoginSuccess"
    />

    <!-- Главная страница -->
    <MainTab 
      v-if="activeTab === 'main'"
      :currentUserPhone="currentUserPhone"
      :currentUserName="currentUserName"
      :currentUserCap="currentUserCap"
      @go-to-profile="setTab('profile')"
    />

    <!-- Профиль -->
    <ProfileTab 
      v-if="activeTab === 'profile'"
      :currentUserPhone="currentUserPhone"
      :currentUserName="currentUserName"
      :currentUserCap="currentUserCap"
      @go-to-main="setTab('main')"
      @logout="handleLogout"
    />
  </div>
</template>

<script>
import { db } from '@/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import LoginTab from '@/components/LoginTab.vue';
import MainTab from '@/components/MainTab.vue';
import ProfileTab from '@/components/ProfileTab.vue';

export default {
  components: {
    LoginTab,
    MainTab,
    ProfileTab
  },
  data() {
    return {
      activeTab: 'number',
      currentUserPhone: '',
      currentUserName: '',
      currentUserCap: '',
      currentUserWallet: '',
      currentUserSticker: ''
    };
  },
  methods: {
    setTab(tabName) {
      this.activeTab = tabName;
      console.log('📱 Переключение на вкладку:', tabName);
    },
    
    handleLoginSuccess(userData) {
      console.log('✅ Вход выполнен:', userData);
      this.currentUserPhone = userData.phone;
      this.currentUserName = userData.name;
      this.currentUserCap = userData.cap;
      this.currentUserWallet = userData.wallet || '';
      this.activeTab = 'main';
    },
    
    handleLogout() {
      console.log('👋 Выход из аккаунта');
      localStorage.removeItem('geckogram_user');
      this.currentUserPhone = '';
      this.currentUserName = '';
      this.currentUserCap = '';
      this.currentUserWallet = '';
      this.currentUserSticker = '';
      this.activeTab = 'number';
      console.log('✅ Сессия очищена');
    },
    
    async checkSession() {
      const savedUser = localStorage.getItem('geckogram_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const userRef = doc(db, 'users', userData.phone);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            this.currentUserPhone = userData.phone;
            this.currentUserName = userData.name;
            this.currentUserCap = userData.cap;
            this.currentUserWallet = userData.wallet || '';
            this.activeTab = 'main';
            console.log('🔄 Сессия восстановлена');
          } else {
            localStorage.removeItem('geckogram_user');
            this.activeTab = 'number';
          }
        } catch (e) {
          console.error('Ошибка восстановления сессии:', e);
          localStorage.removeItem('geckogram_user');
          this.activeTab = 'number';
        }
      } else {
        this.activeTab = 'number';
      }
    }
  },
  mounted() {
    this.checkSession();
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
}

#preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>