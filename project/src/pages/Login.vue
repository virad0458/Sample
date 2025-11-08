<template>
  <div class="auth-container">
    <h2>Login</h2>
    <form @submit.prevent="loginUser">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <p>
        <router-link to="/forgot-password">Forgot your password?</router-link>
      </p>
      <button type="submit">Login</button>
    </form>
    <p>Don’t have an account? <router-link to="/signup">Sign up</router-link></p>
  </div>
</template>


<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    loginUser() {
      // Temporary mock login
      if (this.email === 'test@example.com' && this.password === '1234') {
        alert('Login successful!')
      } else {
        alert('Invalid credentials.')
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 10px;
}
button {
  margin-top: 10px;
  padding: 10px;
  width: 100%;
}
</style>
