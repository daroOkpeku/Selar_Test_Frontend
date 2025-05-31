<script setup>
import { ref, onMounted } from 'vue';
import CalendarConnect from '@/components/CalendarConnect.vue';
import { useRouter } from 'vue-router'
import { AES, enc } from 'crypto-js'
const router = useRouter()
const isAuthed = ref(false);
const availableSlots = ref([]);
const localData = ref({})
const handleAuth = () => {
  isAuthed.value = true;
};

const fetchSlots = async (date) => {
  // Load events for selected date using Google Calendar API
  // Parse and filter 1-hour blocks from 8AM to 5PM
  // Set availableSlots
};

const bookSlot = async (slot, visitorDetails) => {
  // Create Google Calendar event for vendor and visitor
};

// onMounted(() => {
// const userInfo = localStorage.getItem('userinfo')


// if (userInfo) {
//   try {
//    let datax = JSON.parse(userInfo)
//        localData.value = datax
//     // console.log('User token:', localData.value.token)
//   } catch (e) {
//     // console.error('Error parsing user info:', e)
//     router.push({ name: 'login' })
//   }
// } else {
//   router.push({ name: 'login' })
// }

// })


</script>

<template>

 <div class="p-4">
    <CalendarConnect @authenticated="handleAuth" :localData="localData" />
    <!-- <DatePicker v-if="isAuthed" @dateSelected="fetchSlots" />
    <TimeSlots
      v-if="availableSlots.length"
      :slots="availableSlots"
      @book="bookSlot"
    /> -->
  </div>

 
</template>

<style scoped>

</style>
