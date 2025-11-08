<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="registerUser">
      <input type="text" v-model="name" placeholder="Full Name" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Create Account</button>
    </form>
    <p>Already have an account? <router-link to="/login">Log in</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: ''
    }
  },
  methods: {
    registerUser() {
      // Temporary local registration
      localStorage.setItem('user', JSON.stringify({
        name: this.name,
        email: this.email,
        password: this.password
      }))
      alert('Account created! You can now log in.')
      this.$router.push('/login')
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
