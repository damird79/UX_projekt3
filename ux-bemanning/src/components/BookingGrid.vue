<template>
    <div class="grid-container">
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th v-for="date in dateRange" :key="'day-' + date">
                        {{ formatDay(date) }}
                    </th>
                </tr>
                <tr>
                    <th>Anställd</th>
                    <th v-for="date in dateRange" :key="'date-' + date">
                        {{ formatDate(date) }}
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
    background-color: white;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th,
td {
    padding: 6px;
    text-align: center;
    border: 1px solid #ccc;
    min-width: 40px;
    background-color: white;
    color: black;
}

.person-cell {
    text-align: left;
    min-width: 160px;
}

.cell {
    height: 40px;
}
</style>