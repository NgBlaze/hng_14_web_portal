<template>
  <div>
    <NavBar />
    <main class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Natural Language Search</h1>

      <form @submit.prevent="doSearch" class="flex gap-3 mb-6">
        <input
          v-model="query"
          class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder='e.g. "young males from Nigeria" or "adult women in Germany"'
        />
        <button
          type="submit"
          :disabled="loading || !query.trim()"
          class="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors"
        >
          Search
        </button>
      </form>

      <div v-if="searched && !loading">
        <p class="text-sm text-gray-500 mb-4">
          {{ total }} result{{ total !== 1 ? 's' : '' }} for <strong>"{{ lastQuery }}"</strong>
        </p>
        <ProfilesTable :profiles="results" @select="id => $router.push(`/profiles/${id}`)" />
        <Pagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" :total="total" @change="goTo" />
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">Searching…</div>
      <div v-if="errorMsg" class="text-center py-12 text-red-500">{{ errorMsg }}</div>

      <div v-if="!searched && !loading" class="mt-8 bg-brand-50 rounded-xl p-6 text-sm text-brand-700">
        <p class="font-semibold mb-2">Try queries like:</p>
        <ul class="space-y-1 list-disc list-inside text-brand-600">
          <li>young males from Nigeria</li>
          <li>adult women in Germany</li>
          <li>seniors above 60</li>
          <li>teenagers between 13 and 17</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import ProfilesTable from '../components/ProfilesTable.vue'
import Pagination from '../components/Pagination.vue'
import { get } from '../api/client'

const query     = ref('')
const lastQuery = ref('')
const results   = ref([])
const loading   = ref(false)
const errorMsg  = ref(null)
const searched  = ref(false)
const page      = ref(1)
const total     = ref(0)
const totalPages = ref(1)

async function doSearch() {
  if (!query.value.trim()) return
  loading.value = true
  errorMsg.value = null
  lastQuery.value = query.value

  try {
    const resp = await get('/api/profiles/search', { params: { q: query.value, page: page.value, limit: 20 } })
    const data = await resp.json()
    if (!resp.ok) { errorMsg.value = data.message; return }
    results.value   = data.data ?? []
    total.value     = data.total ?? 0
    totalPages.value = data.total_pages ?? 1
    searched.value  = true
  } catch {
    errorMsg.value = 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function goTo(p) { page.value = p; doSearch() }
</script>
