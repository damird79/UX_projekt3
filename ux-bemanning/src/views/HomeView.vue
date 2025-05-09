<template>
    <div>
      <h1>Bokningar</h1>
      <BookingGrid :bookings="bookings" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { fetchBookings } from '../services/bookingService';
  import { format } from 'date-fns';
  import BookingGrid from '../components/BookingGrid.vue';
  
  const bookings = ref([]);
  
  onMounted(async () => {
    const start = format(new Date(), 'yyyy-MM-dd');
    const end = format(new Date(new Date().setDate(new Date().getDate() + 28)), 'yyyy-MM-dd');
    bookings.value = await fetchBookings(start, end);
  });
  </script>
  