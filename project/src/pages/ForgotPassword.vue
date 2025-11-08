<template>
  <div class="auth-container">
    <h2>Forgot Password</h2>
    <p>Enter your email address to reset your password.</p>
    <form @submit.prevent="resetPassword">
      <input type="email" v-model="email" placeholder="Email" required />
      <button type="submit">Send Reset Link</button>
    </form>
    <p><router-link to="/login">Back to Login</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    }
  },
  methods: {
    resetPassword() {
      // For now, this just simulates the process
      if (this.email) {
        alert(`A reset link has been sent to ${this.email}`)
        this.$router.push('/login')
      } else {
        alert('Please enter your email.')
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
