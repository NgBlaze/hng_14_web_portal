<template>
  <div>
    <NavBar />
    <main class="max-w-2xl mx-auto px-6 py-8">
      <button @click="$router.back()" class="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div v-if="loading" class="text-center py-16 text-gray-400">Loading…</div>
      <div v-else-if="error" class="text-center py-16 text-red-500">{{ error }}</div>
      <div v-else-if="profile" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-5 text-white">
          <h1 class="text-2xl font-bold capitalize">{{ profile.name }}</h1>
          <p class="text-brand-100 text-sm mt-0.5">{{ profile.id }}</p>
        </div>

        <div class="divide-y divide-gray-100">
          <Row label="Gender">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="profile.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'"
            >
              {{ profile.gender }}
            </span>
            <span class="text-gray-400 text-sm ml-2">{{ pct(profile.gender_probability) }} confidence</span>
          </Row>
          <Row label="Age">{{ profile.age }} <span class="text-gray-400 text-sm ml-2 capitalize">({{ profile.age_group }})</span></Row>
          <Row label="Country">
            <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{{ profile.country_id }}</span>
            {{ profile.country_name }}
            <span class="text-gray-400 text-sm ml-2">{{ pct(profile.country_probability) }} confidence</span>
          </Row>
          <Row label="Created">{{ profile.created_at }}</Row>
        </div>

        <div v-if="isAdmin" class="px-6 py-4 border-t border-gray-100">
          <button
            @click="handleDelete"
            class="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            :disabled="deleting"
          >
            {{ deleting ? 'Deleting…' : 'Delete profile' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuthStore } from '../stores/auth'
import { get, del } from '../api/client'

const Row = defineComponent({
  props: { label: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'px-6 py-4 flex items-center gap-2' }, [
      h('span', { class: 'w-32 text-sm text-gray-500 flex-shrink-0' }, props.label),
      h('div', { class: 'text-gray-900 text-sm flex items-center flex-wrap' }, slots.default?.()),
    ])
  },
})

const route   = useRoute()
const router  = useRouter()
const auth    = useAuthStore()

const profile = ref(null)
const loading = ref(true)
const error   = ref(null)
const deleting = ref(false)

const isAdmin = computed(() => auth.user?.role === 'admin')
const pct = (v) => `${Math.round((v ?? 0) * 100)}%`

async function load() {
  loading.value = true
  try {
    const resp = await get(`/api/profiles/${route.params.id}`)
    const data = await resp.json()
    if (!resp.ok) { error.value = data.message; return }
    profile.value = data.data
  } catch {
    error.value = 'Failed to load profile.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this profile permanently?')) return
  deleting.value = true
  try {
    const resp = await del(`/api/profiles/${route.params.id}`)
    if (resp?.status === 204) {
      router.push('/profiles')
    } else {
      const data = resp ? await resp.json().catch(() => ({})) : {}
      error.value = data.message || 'Failed to delete profile.'
      deleting.value = false
    }
  } catch {
    error.value = 'Failed to delete profile.'
    deleting.value = false
  }
}

onMounted(load)
</script>
