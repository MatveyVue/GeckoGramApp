// src/utils/auth.js
import { db } from '@/firebase.js';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default {
  data() {
    return {
      activeTab: 'initial',
      phone: '',
      password: '',
      loginError: '',
      currentUserPhone: '',
      currentUserName: '',
      currentUserCap: '',
      isLoading: false
    }
  },
  
  methods: {
    setTab(tabName) {
      this.activeTab = tabName;
    },
    
    getDefaultAvatar(phone) {
      return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
    },
    
    async checkLogin() {
      if (!this.phone || !this.password) {
        this.loginError = 'Please enter phone and password';
        return;
      }
      
      this.isLoading = true;
      this.loginError = '';
      
      try {
        const cleanPhone = this.phone.replace(/\D/g, '');
        console.log('🔍 Поиск пользователя:', cleanPhone);
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', cleanPhone));
        const querySnapshot = await getDocs(q);
        
        let userDoc, userData;
        
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
          userData = userDoc.data();
        } else {
          const userDocRef = doc(db, 'users', cleanPhone);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            userDoc = docSnap;
            userData = docSnap.data();
          }
        }
        
        if (!userData) {
          this.loginError = 'Пользователь не найден';
          return;
        }
        
        console.log('👤 Найден пользователь:', userData);
        
        if (userData.password !== this.password) {
          this.loginError = 'Неверный пароль';
          return;
        }
        
        this.currentUserPhone = cleanPhone;
        this.currentUserName = userData.name || userData.username || userData.fullName || `User_${cleanPhone.slice(-4)}`;
        this.currentUserCap = userData.cap || userData.avatar || userData.photoURL || this.getDefaultAvatar(cleanPhone);
        
        const userRef = userDoc.id ? doc(db, 'users', userDoc.id) : doc(db, 'users', cleanPhone);
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // ✅ Сохраняем сессию БЕЗ timestamp (бессрочно)
        localStorage.setItem('geckogram_user', JSON.stringify({
          phone: cleanPhone,
          name: this.currentUserName,
          cap: this.currentUserCap
        }));
        
        this.activeTab = 'main';
        console.log('🎉 Успешный вход!', this.currentUserName);
        
      } catch (error) {
        console.error('🔥 Ошибка:', error);
        this.loginError = 'Ошибка входа. Попробуйте еще раз.';
      } finally {
        this.isLoading = false;
      }
    },
    
    // ✅ Проверка сессии - БЕЗ проверки времени
    checkSession() {
      try {
        const savedUser = localStorage.getItem('geckogram_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // ✅ Просто восстанавливаем сессию без проверки timestamp
          this.currentUserPhone = userData.phone;
          this.currentUserName = userData.name;
          this.currentUserCap = userData.cap || this.getDefaultAvatar(userData.phone);
          this.activeTab = 'main';
          
          console.log('🔄 Сессия восстановлена для:', userData.name);
          return true;
        }
      } catch (e) {
        console.error('Ошибка восстановления сессии:', e);
        localStorage.removeItem('geckogram_user');
      }
      return false;
    },
    
    // ✅ Выход из аккаунта
    logout() {
      localStorage.removeItem('geckogram_user');
      this.activeTab = 'initial';
      this.currentUserPhone = '';
      this.currentUserName = '';
      this.currentUserCap = '';
      console.log('👋 Выход из аккаунта');
    },
    
    async updateCap(newCap) {
      if (!this.currentUserPhone) return;
      
      try {
        const cleanPhone = this.currentUserPhone.replace(/\D/g, '');
        const userRef = doc(db, 'users', cleanPhone);
        
        await setDoc(userRef, {
          cap: newCap,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        this.currentUserCap = newCap;
        
        const savedUser = localStorage.getItem('geckogram_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.cap = newCap;
          localStorage.setItem('geckogram_user', JSON.stringify(userData));
        }
        
        console.log('✅ CAP обновлен:', newCap);
      } catch (error) {
        console.error('Ошибка обновления CAP:', error);
      }
    }
  },
  
  mounted() {
    this.checkSession();
  }
}