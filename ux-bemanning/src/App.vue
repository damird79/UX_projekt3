<template>
  <BookingGrid
    :bookings="bookings"
    :dateRange="visibleDates"
    @back="onBack"
    @forward="onForward"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchBookings } from './services/bookingService'
import BookingGrid from './components/BookingGrid.vue'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

const bookings = ref([])
const dateRange = ref([])

function mockType() {
  const types = ['booked', 'preliminary', 'absence', 'free']
  return types[Math.floor(Math.random() * types.length)]
}

function mockPercentage(type) {
  if (type === 'absence') return 100
  if (type === 'free') return 0
  if (type === 'booked' || type === 'preliminary') return Math.random() > 0.5 ? 100 : 50
  return 0
}

onMounted(async () => {
  const start = '2025-04-07'
  const end = '2025-05-05'

  const data = await fetchBookings(start, end)

  const allDates = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) })
    .map(d => format(d, 'yyyy-MM-dd'))

  data.forEach(person => {
    const bookedDates = new Set(person.bookings.map(b => format(parseISO(b.date || b.from), 'yyyy-MM-dd')))
    allDates.forEach(date => {
      if (!bookedDates.has(date)) {
        const type = mockType()
        person.bookings.push({
          date,
          type,
          percentage: mockPercentage(type),
        })
      }
    })
  })

  bookings.value = data
  dateRange.value = allDates
})

const visibleStartIndex = ref(0)
const visibleDates = computed(() =>
  dateRange.value.slice(visibleStartIndex.value, visibleStartIndex.value + 20)
)

function onBack() {
  if (visibleStartIndex.value > 0) {
    visibleStartIndex.value -= 1
  }
}

function onForward() {
  if (visibleStartIndex.value + 20 < dateRange.value.length) {
    visibleStartIndex.value += 1
  }
}
</script>
