<template>
  <div class="grid-container">

    <table>
      <thead>
        <tr>
          <th class="label-header">Anställd</th>
          <th class="nav-cell-back">
            <button @click="$emit('back')" class="nav-button">‹</button>
          </th>
          <th v-for="date in dateRange" :key="date" class="date-box" :class="{ today: isToday(date) }">
            <div class="day">{{ formatDay(date) }}</div>
            <div class="date">{{ formatDate(date) }}</div>
          </th>
          <th class="nav-cell-forward">
            <button @click="$emit('forward')" class="nav-button">›</button>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="person in bookings" :key="person.name">
          <td class="label-cell">
            <strong>{{ person.name }}</strong><br />
            <small>{{ person.professions.join(' / ') }}</small>
          </td>
          <td v-for="date in dateRange" :key="date" class="cell" :class="getBookingClass(person.bookings, date)">
            {{ getBookingLabel(person.bookings, date) }}
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</template>


<script setup>
import { format, parseISO, isWeekend } from 'date-fns'
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
  return format(parseISO(date), 'd')
}

function formatDay(date) {
  return format(parseISO(date), 'EEE', { locale: sv })
}

function getBookingClass(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const booking = bookings.find(b => b.date === dateStr)
  if (!booking || isWeekend(parseISO(date))) return ''
  if (booking.type === 'absence') return ''
  if (booking.type === 'booked') return booking.percentage === 100 ? 'bokad100' : 'bokad50'
  if (booking.type === 'preliminary') return booking.percentage === 100 ? 'prelim100' : 'prelim50'
  return ''
}

function getBookingLabel(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const booking = bookings.find(b => b.date === dateStr)
  if (!booking || isWeekend(parseISO(date))) return ''
  if (booking.type === 'absence') return 'Frånvaro'
  if (booking.type === 'booked') return booking.percentage === 100 ? 'Bokad' : 'Bokad 50%'
  if (booking.type === 'preliminary') return booking.percentage === 100 ? 'Prelim 100%' : 'Prelim 50%'
  return ''
}
</script>

<style scoped>
.grid-container {
  background-color: rgb(178, 177, 174, 0.89);
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
  justify-content: center;
  align-items: center;
  writing-mode: vertical-lr;
  text-orientation: mixed;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
}

.bokad100 {
  background-color: rgb(173, 5, 7);
  color: white;
}

.bokad50 {
  background-color: rgb(218, 74, 76);
  color: white;
}

.prelim100 {
  background-color: rgb(255, 208, 53);
  color: black;
}

.prelim50 {
  background-color: rgb(255, 237, 149);
  color: black;
}

.ledig {
  background-color: rgb(173, 243, 185);
  color: black;
}

.date-box {
  background: rgb(255, 255, 255);
  border-radius: 6px;
  padding: 4px 0;
  width: 70px;
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

.nav-button {
  background: transparent;
  border: none;
  color: black;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  outline: none;

}

.nav-cell-back,
.nav-cell-forward {
  background: transparent;
  border: none;
  padding: 0;
  width: 30px;
}


.nav-cell-back {
  text-align: right;
  padding-left: 0.5rem;

}

.nav-cell-forward {
  text-align: left;

}

</style>