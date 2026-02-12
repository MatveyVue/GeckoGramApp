<template>
  <div class="login">
    <div class="container">
      <!-- Логотип -->
      <div class="logo-wrapper">
        <img 
          class="logo" 
          src="https://github.com/MatveyVue/geckogram/blob/main/gecko.png?raw=true" 
          alt="GeckoGram"
        >
      </div>

      <!-- Заголовок -->
      <h1 class="title">GeckoGram</h1>
      <p class="subtitle">Enter your phone number and password</p>

      <!-- Форма -->
      <div class="form">
        <div class="input-group">
          <span class="input-icon">📱</span>
          <input 
            class="input" 
            type="tel" 
            v-model="phone" 
            placeholder="Phone number"
            @keyup.enter="checkLogin"
          >
        </div>

        <div class="input-group">
          <span class="input-icon">🔒</span>
          <input 
            class="input" 
            type="password" 
            v-model="password" 
            placeholder="Password"
            @keyup.enter="checkLogin"
          >
        </div>

        <button 
          class="button"
          @click="checkLogin" 
          :disabled="!phone || !password"
        >
          <span class="btn-text">Continue</span>
          <span class="btn-icon">→</span>
        </button>

        <p v-if="loginError" class="error">
          {{ loginError }}
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import { db } from '@/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default {
  name: 'LoginTab',
  data() {
    return {
      phone: '',
      password: '',
      loginError: ''
    };
  },
  methods: {
    async checkLogin() {
      if (!this.phone || !this.password) {
        this.loginError = 'Please enter phone and password';
        return;
      }
      
      try {
        const cleanPhone = this.phone.replace(/\D/g, '');
        console.log('🔍 Поиск пользователя:', cleanPhone);
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', cleanPhone));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          this.loginError = 'User not found';
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (userData.password === this.password) {
          const userInfo = {
            phone: cleanPhone,
            name: userData.name || `User_${cleanPhone.slice(-4)}`,
            cap: userData.cap || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            wallet: userData.wallet || '',
            docId: userDoc.id
          };
          
          localStorage.setItem('geckogram_user', JSON.stringify(userInfo));
          this.$emit('login-success', userInfo);
        } else {
          this.loginError = 'Invalid password';
        }
        
      } catch (error) {
        console.error('🔥 Ошибка:', error);
        this.loginError = 'Login failed. Try again.';
      }
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.container {
  max-width: 360px;
  width: 90%;
  text-align: center;
  padding: 20px 0;
}

.logo-wrapper {
  margin-bottom: 24px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: cover;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.subtitle {
  font-size: 15px;
  color: #6c757d;
  margin: 0 0 32px 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #6c757d;
  font-size: 18px;
}

.input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 15px;
  transition: all 0.2s;
  background: #f8f9fa;
}

.input:focus {
  outline: none;
  border-color: #000000;
  background: #ffffff;
}

.input::placeholder {
  color: #adb5bd;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  background: #000000;
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.button:hover:not(:disabled) {
  opacity: 0.8;
}

.button:active:not(:disabled) {
  transform: scale(0.98);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  transition: transform 0.2s;
}

.button:hover:not(:disabled) .btn-icon {
  transform: translateX(4px);
}

.error {
  color: #dc3545;
  font-size: 14px;
  margin: 8px 0 0;
  animation: shake 0.3s ease-in-out;
}

.link-btn {
  background: none;
  border: none;
  color: #000000;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
}

.link-btn:hover {
  text-decoration: underline;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 480px) {
  .logo {
    width: 70px;
    height: 70px;
  }
  
  .title {
    font-size: 26px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .input {
    padding: 12px 16px 12px 48px;
    font-size: 14px;
  }
  
  .button {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>