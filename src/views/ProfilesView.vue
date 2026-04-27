<template>
  <div>
    <NavBar />
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Profiles</h1>
        <a
          :href="`${apiUrl}/api/profiles/export?format=csv`"
          class="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select v-model="filters.gender" class="select">
          <option value="">Any gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select v-model="filters.age_group" class="select">
          <option value="">Any age group</option>
          <option value="child">Child</option>
          <option value="teenager">Teenager</option>
          <option value="adult">Adult</option>
          <option value="senior">Senior</option>
        </select>
        <input v-model="filters.country_id" class="input" placeholder="Country code (e.g. NG)" maxlength="2" />
        <div class="flex gap-2">
          <select v-model="filters.sort_by" class="select flex-1">
            <option value="">Sort by</option>
            <option value="age">Age</option>
            <option value="created_at">Date</option>
            <option value="gender_probability">Gender %</option>
          </select>
          <select v-model="filters.order" class="select w-24">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <button @click="applyFilters" class="btn-primary col-span-2 md:col-span-1">Apply</button>
        <button @click="resetFilters" class="btn-ghost col-span-2 md:col-span-1">Reset</button>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">Loading profiles…</div>
      <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>
      <template v-else>
        <ProfilesTable :profiles="profiles" @select="id => $router.push(`/profiles/${id}`)" />
        <Pagination :page="page" :total-pages="totalPages" :total="total" @change="goTo" />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ProfilesTable from '../components/ProfilesTable.vue'
import Pagination from '../components/Pagination.vue'
import { get } from '../api/client'

const apiUrl = import.meta.env.VITE_API_URL || 'https://hng-14-stage-1.vercel.app'

const profiles  = ref([])
const loading   = ref(false)
const error     = ref(null)
const page      = ref(1)
const total     = ref(0)
const totalPages = ref(1)
const limit     = 20

const filters = reactive({ gender: '', age_group: '', country_id: '', sort_by: '', order: 'asc' })

async function load() {
  loading.value = true
  error.value = null
  const params = { page: page.value, limit }
  if (filters.gender)     params.gender     = filters.gender
  if (filters.age_group)  params.age_group  = filters.age_group
  if (filters.country_id) params.country_id = filters.country_id.toUpperCase()
  if (filters.sort_by)    params.sort_by    = filters.sort_by
  if (filters.order !== 'asc') params.order = filters.order

  try {
    const resp = await get('/api/profiles', { params })
    const data = await resp.json()
    profiles.value  = data.data ?? []
    total.value     = data.total ?? 0
    totalPages.value = data.total_pages ?? 1
  } catch {
    error.value = 'Failed to load profiles.'
  } finally {
    loading.value = false
  }
}

function applyFilters() { page.value = 1; load() }
function resetFilters()  { Object.assign(filters, { gender: '', age_group: '', country_id: '', sort_by: '', order: 'asc' }); applyFilters() }
function goTo(p)         { page.value = p; load() }

onMounted(load)
</script>

<style scoped>
.select { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500; }
.input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500; }
.btn-primary { @apply bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors; }
.btn-ghost   { @apply border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors; }
</style>
