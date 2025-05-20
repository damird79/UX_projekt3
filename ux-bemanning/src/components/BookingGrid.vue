<template>
  <div class="grid-container">
    <div class="grid-header">
      <table>
        <thead>
          <tr>
            <th class="view-toggle-cell" rowspan="2">
              <div class="view-toggle-switch">
                <button class="toggle-btn" :class="{ active: currentView === 'day' }" @click="$emit('switch', 'day')">
                  Dag
                </button>
                <button class="toggle-btn" :class="{ active: currentView === 'week' }" @click="$emit('switch', 'week')">
                  Vecka
                </button>
                <button class="toggle-btn" :class="{ active: currentView === 'month' }"
                  @click="$emit('switch', 'month')">
                  Månad
                </button>
              </div>
            </th>
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
          <tr class="spacer-row">
            <td :colspan="dateRange.length + 3" style="height: 10px; padding: 0; border: none;"></td>
          </tr>
          <tr v-for="person in bookings" :key="person.name">
            <td class="label-cell">
              <input type="checkbox" :checked="selectedWorkers.includes(person.name)"
                @change="$emit('toggle-worker', person.name)" style="margin-right: 6px;" />
              <strong>{{ person.name }}</strong><br />
              <small>{{ person.professions.join(' / ') }}</small>
            </td>
            <td class="spacer-cell"></td>

            <td v-for="date in dateRange" :key="date" :class="['cell', getBookingClass(person.bookings, date)]">
              <template v-if="getBookingClass(person.bookings, date) === 'half-absence'">
                <div class="half-absence-container">
                  <div class="half absence">Frånvaro</div>
                  <div class="half booked">{{ getSplitLabel(person.bookings, date) }}</div>
                </div>
              </template>

              <template v-else-if="getBookingClass(person.bookings, date) === 'half-booked'">
                <div class="half-absence-container">
                  <div class="half" :class="getBookingTypeClass(person.bookings, date)">
                    {{ getSplitLabel(person.bookings, date) }}
                  </div>
                  <div class="half available">Tillgänglig</div>
                </div>
              </template>

              <template v-else>
                {{ getBookingLabel(person.bookings, date) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { format, parseISO, isWeekend } from 'date-fns'
import { sv } from 'date-fns/locale'

const props = defineProps({
  bookings: Array,
  dateRange: Array,
  currentView: String,
  selectedWorkers: Array
})
defineEmits(['toggle-worker'])

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

function getSplitLabel(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const booking = bookings.find(b => b.date === dateStr && (b.type === 'booked' || b.type === 'preliminary'))
  if (!booking) return ''
  if (booking.type === 'booked') return booking.percentage === 100 ? 'Bokad' : 'Bokad 50%'
  if (booking.type === 'preliminary') return booking.percentage === 100 ? 'Prelim 100%' : 'Prelim 50%'
  return ''
}

function getBookingClass(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const isWeekendDay = isWeekend(parseISO(date))

  const dayBookings = bookings.filter(b => b.date === dateStr && typeof b.type === 'string')

  if (isWeekendDay) return 'weekend'
  if (!dayBookings.length) return 'available'

  if (
    dayBookings.length === 1 &&
    (dayBookings[0].type === 'preliminary' || dayBookings[0].type === 'booked') &&
    dayBookings[0].percentage === 50
  ) {
    return 'half-booked'
  }


  const hasAbsence = dayBookings.some(b => b.type === 'absence')
  const hasBooking = dayBookings.some(b => b.type === 'booked' || b.type === 'preliminary')

  if (hasAbsence && hasBooking) return 'half-absence'
  if (hasAbsence) return 'absence-only'

  const booking = dayBookings[0]
  if (booking.type === 'booked') return booking.percentage === 100 ? 'bokad100' : 'bokad50'
  if (booking.type === 'preliminary') return booking.percentage === 100 ? 'prelim100' : 'prelim50'

  return 'available'
}

function getBookingTypeClass(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const booking = bookings.find(b =>
    b.date === dateStr &&
    (b.type === 'preliminary' || b.type === 'booked') &&
    b.percentage === 50
  )

  if (!booking) return ''
  return booking.type === 'booked' ? 'booked50' : 'prelim50'
}

function getBookingLabel(bookings, date) {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd')
  const booking = bookings.find(b => b.date === dateStr)
  if (isWeekend(parseISO(date))) return 'Helg'
  if (!booking) return 'Tillgänglig'
  if (booking.type === 'absence') return 'Frånvaro'
  if (booking.type === 'booked') return booking.percentage === 100 ? 'Bokad' : 'Bokad 50%'
  if (booking.type === 'preliminary') return booking.percentage === 100 ? 'Prelim 100%' : 'Prelim 50%'
  return 'Tillgänglig'
}
</script>

<style scoped>
.grid-container {
  background-color: rgb(178, 177, 174, 0.89);
  width: 100vw;
  max-width: 100%;
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
  border-radius: 6px;
  margin: 4px;
  padding: 8px 10px;
  height: 70px;
  display: flex;
}

.cell {
  border-radius: 10px;
  height: 5rem;
  background-color: #f5f5f5;
  writing-mode: vertical-lr;
  font-size: 10px;
  min-width: 2rem;
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
  height: 80px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin: 4px auto;
  margin-bottom: 2rem;
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

.view-toggle-cell {
  vertical-align: middle;
  padding: 0.5rem 1rem;
  background: transparent;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-toggle-switch {
  display: flex;
  background-color: white;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #ccc inset;
}

.toggle-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #666;
  transition: background 0.2s, color 0.2s;
}

.toggle-btn.active {
  background-color: #6d68b3;
  color: white;
}

.absence-only {
  background-color: rgb(76, 53, 244);
  color: white;
}

.spacer-cell {
  width: 10px;
  background-color: transparent;
  border: none;
  padding: 0;
}

.half-split-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.half {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  white-space: nowrap;
  padding: 0;
  margin: 0;
}

.booked50 {
  background-color: rgb(218, 74, 76);
  color: white;
}

.prelim50 {
  background-color: rgb(255, 237, 149);
  color: black;
}

.available {
  background-color: rgb(176, 243, 185);
  color: black;
}

.cell.available {
  background-color: rgb(176, 243, 185);
  color: black;
}

.cell.half-booked,
.cell.half-absence {
  padding: 0;
}

.cell.half-booked>div,
.cell.half-absence>div {
  width: 100%;
  height: 100%;
}
</style>