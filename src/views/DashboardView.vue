<template>
  <div>
    <NavBar />
    <main class="max-w-6xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Profiles" :value="stats.total" :loading="loading" />
        <StatCard label="Male" :value="stats.male" :loading="loading" />
        <StatCard label="Female" :value="stats.female" :loading="loading" />
        <StatCard label="Adults" :value="stats.adults" :loading="loading" />
      </div>

      <!-- Age group breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Age Groups</h2>
        <div v-if="loading" class="animate-pulse space-y-2">
          <div v-for="i in 4" :key="i" class="h-6 bg-gray-100 rounded" />
        </div>
        <div v-else class="space-y-3">
          <div v-for="group in ageGroups" :key="group.label" class="flex items-center gap-3">
            <span class="w-20 text-sm text-gray-600 capitalize">{{ group.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2.5">
              <div
                class="bg-brand-500 h-2.5 rounded-full transition-all"
                :style="{ width: group.pct + '%' }"
              />
            </div>
            <span class="text-sm text-gray-500 w-12 text-right">{{ group.count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent profiles -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recent Profiles</h2>
          <router-link to="/profiles" class="text-sm text-brand-600 hover:underline">View all →</router-link>
        </div>
        <div v-if="loading" class="animate-pulse space-y-2">
          <div class="h-9 bg-gray-100 rounded w-full" />
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-50 rounded w-full" />
        </div>
        <ProfilesTable v-else :profiles="recent" @select="id => $router.push(`/profiles/${id}`)" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent } from 'vue'
import NavBar from '../components/NavBar.vue'
import ProfilesTable from '../components/ProfilesTable.vue'
import { get } from '../api/client'

// Inline StatCard to keep files minimal
const StatCard = defineComponent({
  props: { label: String, value: [Number, String], loading: Boolean },
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ label }}</p>
      <p v-if="loading" class="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      <p v-else class="text-3xl font-bold text-gray-900">{{ value ?? '—' }}</p>
    </div>
  `,
})

const loading = ref(true)
const stats = ref({ total: 0, male: 0, female: 0, countries: 0 })
const ageGroups = ref([])
const recent = ref([])

async function load() {
  loading.value = true
  try {
    const [allR, maleR, femaleR, recentR] = await Promise.all([
      get('/api/profiles', { params: { limit: 1 } }),
      get('/api/profiles', { params: { limit: 1, gender: 'male' } }),
      get('/api/profiles', { params: { limit: 1, gender: 'female' } }),
      get('/api/profiles', { params: { limit: 5, sort_by: 'created_at', order: 'desc' } }),
    ])

    const [allData, maleData, femaleData, recentData] = await Promise.all([
      allR?.json(), maleR?.json(), femaleR?.json(), recentR?.json(),
    ])

    const total = allData?.total ?? 0
    recent.value = recentData?.data ?? []

    // Age groups — fetched in the same batch, reused for the Adults stat card
    const groups = ['child', 'teenager', 'adult', 'senior']
    const groupData = await Promise.all(
      groups.map(g => get('/api/profiles', { params: { limit: 1, age_group: g } }).then(r => r?.json()))
    )
    ageGroups.value = groups.map((label, i) => ({
      label,
      count: groupData[i]?.total ?? 0,
      pct: total ? Math.round(((groupData[i]?.total ?? 0) / total) * 100) : 0,
    }))

    const adultCount = groupData[groups.indexOf('adult')]?.total ?? 0
    stats.value = {
      total,
      male: maleData?.total ?? 0,
      female: femaleData?.total ?? 0,
      adults: adultCount,
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
