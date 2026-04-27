<template>
  <div>
    <NavBar />
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Profiles</h1>
        <a
          :href="`${apiUrl}/api/profiles/export?format=csv&api_version=1`"
          class="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl mb-5">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">Filters</span>
            <span
              v-if="activeFilterCount > 0"
              class="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium"
            >{{ activeFilterCount }}</span>
          </div>
          <button
            v-if="activeFilterCount > 0"
            @click="resetFilters"
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear all
          </button>
        </div>

        <!-- Inputs row -->
        <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
            <select v-model="filters.gender" class="select">
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Age group</label>
            <select v-model="filters.age_group" class="select">
              <option value="">Any</option>
              <option value="child">Child</option>
              <option value="teenager">Teenager</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Country code</label>
            <input v-model="filters.country_id" class="input" placeholder="e.g. NG" maxlength="2" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort by</label>
            <div class="flex gap-2">
              <select v-model="filters.sort_by" class="select flex-1">
                <option value="">Default</option>
                <option value="age">Age</option>
                <option value="created_at">Date</option>
                <option value="gender_probability">Gender %</option>
              </select>
              <select v-model="filters.order" class="select w-24">
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active chips + action buttons -->
        <div class="px-4 pb-4 flex items-center gap-3 flex-wrap">
          <div class="flex flex-wrap gap-2 flex-1">
            <span
              v-if="filters.gender"
              class="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-1 rounded-full"
            >
              {{ filters.gender }}
              <button @click="filters.gender = ''; applyFilters()" class="hover:text-brand-900 font-bold leading-none">×</button>
            </span>
            <span
              v-if="filters.age_group"
              class="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-1 rounded-full"
            >
              {{ filters.age_group }}
              <button @click="filters.age_group = ''; applyFilters()" class="hover:text-brand-900 font-bold leading-none">×</button>
            </span>
            <span
              v-if="filters.country_id"
              class="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-1 rounded-full"
            >
              {{ filters.country_id.toUpperCase() }}
              <button @click="filters.country_id = ''; applyFilters()" class="hover:text-brand-900 font-bold leading-none">×</button>
            </span>
            <span
              v-if="filters.sort_by"
              class="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-full"
            >
              sorted by {{ filters.sort_by }} ({{ filters.order }})
              <button @click="filters.sort_by = ''; filters.order = 'asc'; applyFilters()" class="hover:text-gray-900 font-bold leading-none">×</button>
            </span>
          </div>
          <div class="flex gap-2 ml-auto">
            <button @click="resetFilters" :disabled="loading" class="btn-ghost disabled:opacity-60">Reset</button>
            <button @click="applyFilters" :disabled="loading" class="btn-primary flex items-center gap-2 disabled:opacity-60">
              <svg v-if="loading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ loading ? 'Loading…' : 'Apply' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Skeleton while loading -->
      <div v-if="loading" class="overflow-x-auto rounded-lg border border-gray-200 animate-pulse">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="i in 6" :key="i" class="px-4 py-3">
                <div class="h-3 bg-gray-200 rounded w-16" />
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="i in 8" :key="i">
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-28" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-12" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-8" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-16" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-24" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-100 rounded w-20" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="flex flex-col items-center gap-3 text-red-500">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm">{{ error }}</p>
          <button @click="load" class="text-sm text-brand-600 hover:underline">Try again</button>
        </div>
      </div>

      <template v-else>
        <ProfilesTable :profiles="profiles" @select="id => $router.push(`/profiles/${id}`)" />
        <Pagination :page="page" :total-pages="totalPages" :total="total" @change="goTo" />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ProfilesTable from '../components/ProfilesTable.vue'
import Pagination from '../components/Pagination.vue'
import { get } from '../api/client'

const apiUrl = (import.meta.env.VITE_API_URL || 'https://hng-14-stage-1.vercel.app').replace(/\/$/, '')

const profiles  = ref([])
const loading   = ref(false)
const error     = ref(null)
const page      = ref(1)
const total     = ref(0)
const totalPages = ref(1)
const limit     = 20

const filters = reactive({ gender: '', age_group: '', country_id: '', sort_by: '', order: 'asc' })
const activeFilterCount = computed(() =>
  [filters.gender, filters.age_group, filters.country_id, filters.sort_by].filter(Boolean).length
)

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
