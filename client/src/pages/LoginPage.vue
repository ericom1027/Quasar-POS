<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container style="color: black; background-color: black">
      <q-page class="flex flex-center login-page">
        <q-card class="q-pa-lg shadow-2" style="min-width: 300px; max-width: 400px">
          <q-card-section class="text-center">
            <div class="q-mb-sm">
              <q-img
                src="/Razons.png"
                alt="Logo"
                class="q-mx-auto"
                style="max-width: 200px; height: auto"
                contain
              />
            </div>
            <div class="text-h6">Sign in to your POS account</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin" class="q-gutter-md">
              <q-input v-model="email" label="Email" type="email" />
              <q-input v-model="password" :type="isPwd ? 'password' : 'text'" label="Password">
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-btn label="Sign in" color="primary" type="submit" class="full-width" />
            </q-form>
          </q-card-section>

          <q-card-section v-if="errorMessage" class="text-negative text-caption">
            {{ errorMessage }}
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isPwd = ref(true)

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    await auth.login(email.value, password.value)

    if (auth.user.isAdmin) {
      router.push('/admin-dashboard')
    } else {
      router.push('/openShift')
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Login failed. Please check your credentials.'
  }
}
</script>

<style scoped>
.q-card {
  width: 100%;
  max-width: 400px;
}
</style>
