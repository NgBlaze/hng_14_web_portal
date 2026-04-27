<template>
  <div class="flex items-center justify-between text-sm text-gray-600 mt-4">
    <span>{{ total }} total · page {{ page }} of {{ totalPages }}</span>
    <div class="flex gap-2">
      <button
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
        class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        ← Prev
      </button>
      <button
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
        class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ page: Number, totalPages: Number, total: Number })
defineEmits(['change'])
</script>
