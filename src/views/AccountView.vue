<template>
  <div>
    <NavBar />
    <main class="max-w-xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Account</h1>

      <div v-if="auth.user" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-6 flex items-center gap-4">
          <img
            v-if="auth.user.avatar_url"
            :src="auth.user.avatar_url"
            class="w-14 h-14 rounded-full ring-2 ring-white"
            :alt="`${auth.user.username} avatar`"
          />
          <div>
            <p class="text-white font-semibold text-lg">@{{ auth.user.username }}</p>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
              :class="auth.user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-200'"
            >
              {{ auth.user.role }}
            </span>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div class="px-6 py-4 flex justify-between text-sm">
            <span class="text-gray-500">User ID</span>
            <span class="font-mono text-xs text-gray-600 truncate max-w-xs">{{ auth.user.id }}</span>
          </div>
          <div class="px-6 py-4 flex justify-between text-sm">
            <span class="text-gray-500">Email</span>
            <span class="text-gray-800">{{ auth.user.email || '—' }}</span>
          </div>
          <div class="px-6 py-4 flex justify-between text-sm">
            <span class="text-gray-500">Role</span>
            <span class="capitalize text-gray-800">{{ auth.user.role }}</span>
          </div>
          <div class="px-6 py-4 flex justify-between text-sm">
            <span class="text-gray-500">Permissions</span>
            <span class="text-gray-800">
              {{ auth.user.role === 'admin' ? 'Read, write, delete' : 'Read only' }}
            </span>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100">
          <button
            @click="handleLogout"
            class="w-full text-sm text-red-600 hover:text-red-800 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuthStore } from '../stores/auth'

const auth   = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>
