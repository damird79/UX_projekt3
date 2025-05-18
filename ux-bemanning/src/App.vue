<template>

  <div class="filter-bar">
    <button class="apply-filters" @click="applyFilters" :class="{ active: filtersApplied }">Apply Filters</button>
    <div class="search-controls">
      <div class="search-bar-wrapper">
        <div class="search-bar-content">
          <span v-for="chip in activeChips" :key="chip.key" class="chip">
            {{ chip.label }}
            <button @click="removeChip(chip)">×</button>
          </span>
          <input class="search-input" type="text"
            :placeholder="activeChips.length === 0 && searchText === '' ? 'Search by name/profession/experience' : ''"
            v-model="searchText" />
        </div>
      </div>

      <button @click="toggleFilterCard" class="filter-toggle">
        <span>🔍 Filter</span>
      </button>
    </div>
  </div>

  <div v-if="showFilterCard" class="filter-card">
    <div class="filter-header">
      <span>🔍 Filter</span>
      <button @click="toggleFilterCard">✖</button>
    </div>

    <div class="filter-section">
      <strong>Bookings</strong>
      <div class="filter-box">
        <label v-for="status in bookingStatuses" :key="status">
          <input type="radio" v-model="selectedBooking" :value="status" />
          {{ status }}
        </label>
      </div>
    </div>

    <div class="filter-section">
      <strong>Occupation</strong>
      <div class="filter-buttons">
        <button v-for="occ in occupations" :key="occ" @click="toggleSelection(occ, 'occupations')"
          :class="{ selected: selectedOccupations.includes(occ) }">
          {{ occ }}
        </button>
      </div>
    </div>

    <div class="filter-section">
      <strong>Experience</strong>
      <div class="filter-box">
        <button v-for="level in experienceLevels" :key="level" @click="toggleSelection(level, 'experience')"
          :class="{ selected: selectedExperience.includes(level) }">
          {{ level }}
        </button>
      </div>
    </div>

    <div class="filter-section">
      <strong>Date</strong>
      <div class="filter-box">
        <select v-model="selectedDate">
          <option v-for="date in availableDates" :key="date" :value="date">{{ date }}</option>
        </select>
      </div>
    </div>

    <div class="filter-actions">
      <button @click="clearFilters">Clear Search</button>
      <button @click="applyFilters">Search</button>
    </div>
  </div>

  <BookingGrid :bookings="filteredBookings" :dateRange="visibleDates" :currentView="selectedView"
    :selectedWorkers="selectedWorkers" @toggle-worker="toggleWorkerSelection" @switch="selectedView = $event"
    @back="onBack" @forward="onForward" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchBookings } from './services/bookingService'
import BookingGrid from './components/BookingGrid.vue'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

const showFilterCard = ref(false);
const searchText = ref('');
const filtersApplied = ref(false);

const bookingStatuses = ['All', 'Absence', 'Booked', 'Preliminary booking', 'Available'];
const occupations = ['All', 'Carpenter', 'Electrician', 'Painter', 'Mason', 'Plumber'];
const experienceLevels = ['Junior', 'Middle', 'Senior'];
const availableDates = [
  '2025-04-07', '2025-04-08', '2025-04-09', '2025-04-10', '2025-04-11',
  '2025-04-14', '2025-04-15', '2025-04-16', '2025-04-17', '2025-04-18'
];
const selectedBooking = ref('All');
const selectedOccupations = ref([]);
const selectedExperience = ref([]);
const selectedDate = ref('');
const selectedWorkers = ref([]);

const bookings = ref([]);
const dateRange = ref([]);


function toggleFilterCard() {
  showFilterCard.value = !showFilterCard.value;
}

function toggleSelection(value, type) {
  const list = type === 'occupations' ? selectedOccupations.value : selectedExperience.value;
  const index = list.indexOf(value);
  index >= 0 ? list.splice(index, 1) : list.push(value);
}

function toggleWorkerSelection(name) {
  const i = selectedWorkers.value.indexOf(name)
  if (i >= 0) selectedWorkers.value.splice(i, 1)
  else selectedWorkers.value.push(name)
}

function clearFilters() {
  selectedBooking.value = 'All';
  selectedOccupations.value = [];
  selectedExperience.value = [];
  selectedDate.value = '';
  filtersApplied.value = false;
  showFilterCard.value = false;
}

function applyFilters() {
  filtersApplied.value = true;
  showFilterCard.value = false;
}

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

const activeChips = computed(() => {
  const chips = []

  if (selectedBooking.value !== 'All') {
    chips.push({ key: 'booking', label: selectedBooking.value })
  }

  selectedOccupations.value.forEach(occ => {
    if (occ !== 'All') chips.push({ key: `occ-${occ}`, label: occ })
  })

  selectedExperience.value.forEach(exp => {
    chips.push({ key: `exp-${exp}`, label: exp })
  })

  if (selectedDate.value) {
    chips.push({ key: 'date', label: selectedDate.value })
  }

  selectedWorkers.value.forEach(name => {
    chips.push({ key: `worker-${name}`, label: name })
  })

  return chips
})

function removeChip(chip) {
  if (chip.key === 'booking') selectedBooking.value = 'All'
  else if (chip.key.startsWith('occ-')) {
    selectedOccupations.value = selectedOccupations.value.filter(occ => `occ-${occ}` !== chip.key)
  }
  else if (chip.key.startsWith('exp-')) {
    selectedExperience.value = selectedExperience.value.filter(exp => `exp-${exp}` !== chip.key)
  }
  else if (chip.key.startsWith('worker-')) {
    selectedWorkers.value = selectedWorkers.value.filter(n => `worker-${n}` !== chip.key)
  }
  else if (chip.key === 'date') selectedDate.value = ''
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

const filteredBookings = computed(() => {
  if (selectedWorkers.value.length === 0) return bookings.value
  return bookings.value.filter(worker => selectedWorkers.value.includes(worker.name))
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
