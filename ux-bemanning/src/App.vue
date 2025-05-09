<template>
  <BookingGrid :bookings="bookings" :dateRange="dateRange" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchBookings } from './services/bookingService'
import BookingGrid from './components/BookingGrid.vue'
import { format, parseISO, eachDayOfInterval } from 'date-fns'


const bookings = ref([])
const dateRange = ref([])


onMounted(async () => {
  const start = '2025-04-07';
  const end = '2025-05-05';

  const data = await fetchBookings(start, end);
  bookings.value = data;

  // 🧠 Extrahera alla unika datum från bokningarnas intervall
  const dates = new Set();

  data.forEach(person => {
    person.bookings.forEach(b => {
      if (b.from && b.to) {
        const from = parseISO(b.from);
        const to = parseISO(b.to);
        const days = eachDayOfInterval({ start: from, end: to });

        days.forEach(d => {
          dates.add(format(d, 'yyyy-MM-dd'));
        });
      }
    });
  });

  dateRange.value = Array.from(dates).sort();
  console.log('✅ dateRange:', dateRange.value);
});

</script>
