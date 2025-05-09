<template>
    <div class="grid-container">
        <table>
            <thead>
                <tr>
                    <th class="sticky-header">Anställd</th>
                    <th v-for="date in dateRange" :key="date" class="date-box" :class="{ today: isToday(date) }">
                        <div class="day">{{ formatDay(date) }}</div>
                        <div class="date">{{ formatDate(date) }}</div>
                    </th>
                </tr>
            </thead>


            <tbody>
                <tr v-for="person in bookings" :key="person.name">
                    <td class="person-cell">
                        <strong>{{ person.name }}</strong><br />
                        <small>{{ person.professions.join(' / ') }}</small>
                    </td>
                    <td v-for="date in dateRange" :key="date" class="cell"
                        :class="getBookingClass(person.bookings, date)">
                        {{ getBookingLabel(person.bookings, date) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import { format, addDays } from 'date-fns';
import { sv } from 'date-fns/locale'


const props = defineProps({
    bookings: Array,
    dateRange: Array
})


function isToday(date) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return date === today
}


function formatDate(date) {
    if (!date) return '';
    return format(parseISO(date), 'd');
}

import { parseISO } from 'date-fns';

function formatDay(date) {
    if (!date) return '';
    return format(parseISO(date), 'EEE', { locale: sv });
}



function getBookingClass(bookings, date) {
    if (!date) return '';
    const dateStr = format(parseISO(date), 'yyyy-MM-dd');
    const booking = bookings.find(b => b.date === dateStr);
    if (!booking) return 'ledig';
    if (booking.type === 'booked') return booking.percentage === 100 ? 'bokad100' : 'bokad50';
    if (booking.type === 'preliminary') return booking.percentage === 100 ? 'prelim100' : 'prelim50';
    if (booking.type === 'absence') return 'franvaro';
    return '';
}

function getBookingLabel(bookings, date) {
    if (!date) return '';
    const dateStr = format(parseISO(date), 'yyyy-MM-dd');
    const booking = bookings.find(b => b.date === dateStr);
    return booking ? `${booking.percentage}%` : '';
}

</script>

<style scoped>


.grid-container {
    overflow-x: auto;
    background-color: rgb(178, 177, 174, 89);
}

table {
    border-collapse: collapse;
    width: 100%;
}


th,
td {
  padding: 6px;
  text-align: center;
  background-color: white;
  color: black;
  border: none;
}


.person-cell {
  background-color: #fff;
  border-radius: 8px;
  margin: 4px;
  padding: 8px 10px;
  min-width: 200px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  text-align: left;
}



.cell {
  margin: 6px;
  border-radius: 10px;
  height: 48px;
  background-color: #f5f5f5;
  box-shadow: 0 0 0 1px #ddd inset;
}


.date-box {
  background: rgb(255, 255, 255);
  border-radius: 6px;
  padding: 4px 0;
  width: 52px;
  height: 52px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin: 4px auto;
}



.date-box .day {
  font-size: 11px;
  color: #666;
}

.date-box .date {
  font-size: 14px;
  font-weight: bold;
}

.date-box.today {
  background-color: #7b5cd6;
  color: white;
}


</style>