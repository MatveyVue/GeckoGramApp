<template>
  <div class="initial">
    <div class="container">
      <img 
        class="logo" 
        src="https://github.com/MatveyVue/geckogram/blob/main/gecko.png?raw=true" 
        alt="GeckoGram"
      >
      
      <h1 class="title">GeckoGram</h1>
      
      <p class="description">
        Messenger from Russia
      </p>

      <button 
        class="button" 
        @click="$emit('go-to-number')"
      >
        Continue
      </button>

    </div>
  </div>
</template>

<script>
export default {
  name: 'InitialTab'
}
</script>

<style scoped>
.initial {
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

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  border-radius: 16px;
  object-fit: cover;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;
}

.description {
  font-size: 15px;
  color: #6c757d;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.button {
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
  margin-bottom: 48px;
}

.button:hover {
  opacity: 0.8;
}

.button:active {
  transform: scale(0.98);
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #adb5bd;
  font-size: 13px;
}

.dot {
  color: #dee2e6;
}

@media (max-width: 480px) {
  .logo {
    width: 70px;
    height: 70px;
  }
  
  .title {
    font-size: 26px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .button {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>