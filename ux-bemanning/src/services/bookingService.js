import axios from 'axios';

const BASE_URL = 'https://yrgo-web-services.netlify.app/bookings';

export async function fetchBookings(startDate, endDate) {
  try {
    const response = await axios.get(`${BASE_URL}?start=${startDate}&end=${endDate}`);
    return response.data; // array med bokningar
  } catch (error) {
    console.error('Fel vid hämtning av bokningar:', error);
    return [];
  }
}
