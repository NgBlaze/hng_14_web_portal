<template>
  <nav class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-8">
      <span class="font-bold text-brand-600 text-lg tracking-tight">Insighta Labs+</span>
      <div class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="$route.path === link.to
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <router-link to="/account" class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
        <img
          v-if="auth.user?.avatar_url"
          :src="auth.user.avatar_url"
          class="w-7 h-7 rounded-full"
          alt="avatar"
        />
        <span class="hidden sm:inline">@{{ auth.user?.username }}</span>
        <span
          class="text-xs px-1.5 py-0.5 rounded font-medium"
          :class="auth.user?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ auth.user?.role }}
        </span>
      </router-link>
      <button
        @click="handleLogout"
        class="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profiles',  label: 'Profiles' },
  { to: '/search',    label: 'Search' },
]

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>
