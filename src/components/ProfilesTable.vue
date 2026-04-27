<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
        <tr>
          <th class="px-4 py-3 text-left">Name</th>
          <th class="px-4 py-3 text-left">Gender</th>
          <th class="px-4 py-3 text-left">Age</th>
          <th class="px-4 py-3 text-left">Group</th>
          <th class="px-4 py-3 text-left">Country</th>
          <th class="px-4 py-3 text-left">Created</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-if="profiles.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-gray-400">No profiles found.</td>
        </tr>
        <tr
          v-for="p in profiles"
          :key="p.id"
          @click="$emit('select', p.id)"
          class="hover:bg-brand-50 cursor-pointer transition-colors"
        >
          <td class="px-4 py-3 font-medium text-gray-900 capitalize">{{ p.name }}</td>
          <td class="px-4 py-3">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'"
            >
              {{ p.gender }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-700">{{ p.age }}</td>
          <td class="px-4 py-3 capitalize text-gray-600">{{ p.age_group }}</td>
          <td class="px-4 py-3 text-gray-600">
            <span class="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{{ p.country_id }}</span>
            {{ p.country_name }}
          </td>
          <td class="px-4 py-3 text-gray-400">{{ (p.created_at || '').slice(0, 10) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ profiles: { type: Array, default: () => [] } })
defineEmits(['select'])
</script>
