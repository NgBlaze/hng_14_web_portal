<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 w-full max-w-sm text-center">
      <div class="mb-6">
        <span class="text-3xl font-bold text-brand-600 tracking-tight">Insighta</span>
        <span class="text-3xl font-bold text-gray-800"> Labs+</span>
        <p class="mt-2 text-gray-500 text-sm">Profile intelligence platform</p>
      </div>

      <div
        v-if="errorMsg"
        class="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2"
        role="alert"
      >
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ errorMsg }}</span>
      </div>

      <a
        :href="loginUrl"
        class="flex items-center justify-center gap-3 w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        Continue with GitHub
      </a>

      <p class="mt-6 text-xs text-gray-400">
        Access restricted to authorised team members.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const API_URL = (import.meta.env.VITE_API_URL || 'https://hng-14-stage-1.vercel.app').replace(/\/$/, '')

const loginUrl = `${API_URL}/auth/github`

const errorMessages = {
  oauth_failed:          'GitHub authentication failed. Please try again.',
  invalid_state:         'Security check failed. Please try again.',
  token_exchange_failed: 'Could not complete login. Please try again.',
  session_expired:       'Your session has expired. Please log in again.',
}

const errorMsg = computed(() => {
  const err = route.query.error
  return err ? (errorMessages[err] || 'Something went wrong. Please try again.') : null
})
</script>
