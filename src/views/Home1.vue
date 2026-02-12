<template>
<div v-if="initialLoading" id="preloader">
  <div class="loader"></div>
</div>

<div v-if="activeTab === 'initial'" style="text-align: center;">
  <img style="margin-top: 80px" src="https://github.com/MatveyVue/geckogram/blob/main/gecko.png?raw=true" width="150px">
  <h1 style="margin-top: 150px">GeckoGram</h1>
  <p style="color: grey">GeckoGram top 1 Messanger of Russia<br>The team consists of the strongest<br>programmers from Russia</p>
  <button type="button" @click="setTab('number')" class="continue-btn">Continue</button>
</div>

<div v-if="activeTab === 'number'" class="number" style="text-align: center;">
  <img style="margin-top: 80px" src="https://github.com/MatveyVue/geckogram/blob/main/gecko.png?raw=true" width="150px">
  <h1 style="margin-top: 20px">GeckoGram</h1>
  <p style="color: grey">Enter your phone number or Gecko number</p>
  <input class="phone-input" type="tel" v-model="phone" placeholder="Your Number"/><br>
  <input class="password-input" type="password" v-model="password" placeholder="Your Password"/>
  <button type="button" @click="checkLogin" class="continue-btn">Continue</button>
  <p v-if="loginError" style="color: red; margin-top: 10px;">{{ loginError }}</p>
</div>

<div v-if="activeTab === 'main'" class="main" style="text-align: center;">
  <h1>Привет ты вошёл в GeckoGram</h1>
  <p>Ваш номер: {{ currentUserPhone }}</p>
  <div class="bar">
    <button class="bar-btn">Market</button>
    <button style="color: rgb(14, 101, 24)" class="bar-btn">Wall</button>
    <button @click="setTab('profile')" class="bar-btn">Profile</button>
  </div>
</div>

<div v-if="activeTab === 'profile'" class="profile" style="text-align: center; overflow-x: hidden; overflow-y: auto; height: 100vh;">
  <img style="margin-top: 40px; border-radius: 50%; border: 1px solid #c3c3c3;" src="https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png" width="120px">
  <h1 style="font-size: 26px; margin-top: 5px;">{{ currentUserName }}</h1>
  <div class="profile-info">
    <p class="profile-phone"><strong>Phone</strong></p>
    <p class="phone"><b>+333 {{ currentUserPhone.slice(0, 3) }} {{ currentUserPhone.slice(3, 6) }}</b></p>
    <hr style="margin: 20px 0; border: none; border-top: 0.5px solid #c3c3c3; margin-top: -3px;">
    <p class="profile-username"><strong>Username</strong></p>
    <p class="username"><b>@{{ currentUserName }}</b></p>
  </div>

<center>
  <div class="footer">
    <button style="color: white; font-size: 16px;" class="gifts-footer">Gifts</button>
    <button style="font-size: 16px;" @click="setTab('stickers')" class="stickers-footer">Stickers</button>
  </div>
</center>

<div v-if="activeTab === 'stickers'" class="stickers-container">
    <img :src="currentUserSticker" width="100px"><br>
</div>

<div class="gifts-container">
    <img :src="currentUserCap" width="100px"><br>
</div>

  <button style="display: none;" @click="setTab('initial')">Back to Wall</button>
  <div class="bar">
    <button class="bar-btn">Market</button>
    <button @click="setTab('main')" class="bar-btn">Wall</button>
    <button style="color: rgb(14, 101, 24)" @click="setTab('profile')" class="bar-btn">Profile</button>
  </div>
</div>

<div v-if="activeTab === 'stickers'" class="profile" style="text-align: center; overflow-x: hidden; overflow-y: auto; height: 100vh;">
    <img style="margin-top: 40px; border-radius: 50%; border: 1px solid #c3c3c3;" src="https://png.pngtree.com/png-vector/20241101/ourmid/pngtree-green-gecko-on-wall-png-image_14205413.png" width="120px">
    <h1 style="font-size: 26px; margin-top: 5px;">{{ currentUserName }}</h1>
<div class="profile-info">
    <p class="profile-phone"><strong>Phone</strong></p>
    <p class="phone"><b>+333 {{ currentUserPhone.slice(0, 3) }} {{ currentUserPhone.slice(3, 6) }}</b></p>
    <hr style="margin: 20px 0; border: none; border-top: 0.5px solid #c3c3c3; margin-top: -3px;">
    <p class="profile-username"><strong>Username</strong></p>
    <p class="username"><b>@{{ currentUserName }}</b></p>
</div>

<center>
  <div class="footer">
    <button @click="setTab('profile')" style="background-color: rgb(237, 237, 237, 0.6); font-size: 16px;" class="gifts-footer">Gifts</button>
    <button style="background-color: rgb(14, 101, 24, 0.6); color: white; font-size: 16px;" @click="setTab('stickers')" class="stickers-footer">Stickers</button>
  </div>
</center>

<button style="display: none;" @click="setTab('initial')">Back to Wall</button>
  <div class="bar">
    <button class="bar-btn">Market</button>
    <button @click="setTab('main')" class="bar-btn">Wall</button>
    <button style="color: rgb(14, 101, 24)" @click="setTab('profile')" class="bar-btn">Profile</button>
  </div>
</div>

<p style="visibility: hidden;">.</p>
<p style="visibility: hidden;">.</p>
<p style="visibility: hidden;">.</p>
<p style="visibility: hidden;">.</p>
</template>

<script>
import authLogic from '@/utils/auth.js';

export default {
  data() {
    return {
      ...authLogic.data(),
      initialLoading: true
    };
  },
  methods: authLogic.methods,
  created() {
    // Отключаем прелоадер сразу после создания компонента
    this.initialLoading = false;
  },
  mounted() {
    // Вызываем mounted из auth.js
    if (authLogic.mounted) {
      authLogic.mounted.call(this);
    }
  }
}
</script>