

<template>
  <div class="my-4 gap-3">

   
    <section class="w-full  m-auto rounded gap-2 flex flex-col items-center mt-3">
        <button
      v-if="gapiInited"
      @click="handleAuthClick"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Connect Google Calendar
    </button>
    <div v-else>Loading Google API...</div>

        <vue-cal
      v-if="events.length"
      :events="events"
      default-view="month"
      style="height: 700px"
    />

     <VueDatePicker
     v-model="date"
    :enable-time-picker="true"
    :min-time="{ hours: 8, minutes: 0 }"
    :max-time="{ hours: 17, minutes: 0 }"
    :min-date="today"
    :minutes-increment="60"
    :is-24="false"
    :auto-apply="true"
    placeholder="Select appointment time"
      />

      <textarea  rows="6" cols="50" v-model="title" placeholder="Enter Title"></textarea>

      <button @click="createWorkdayEvent" class="bg-green-400 rounded-md py-2 px-2 text-center capitalize">Book appointment</button>
    </section>
  
  </div>
</template>

<script setup>
import { onMounted, ref, defineEmits, watch } from 'vue';
import { watchEffect } from 'vue';
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  import axios from 'axios';

   const title = ref("")
  const date = ref(null)
const today = new Date()
today.setHours(0, 0, 0, 0)

// localData



const props = defineProps({
  localData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});


const events = ref([]);
const accessToken = ref(null);
const gapiInited = ref(false);
const emit = defineEmits(['authenticated']);

const CLIENT_ID = 'ADD YOUR CLIENT_ID'; 
const API_KEY = 'ADD YOUR API_KEY';     
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendarAttributes = ref([])

let tokenClient;



const gapiLoaded = () => {
  return new Promise((resolve, reject) => { 
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited.value = true;
        resolve();
      } catch (error) {
        console.error("Error initializing Google API client:", error); 
        reject(error); 
      }
    });
  });
};


const handleAuthClick = () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Error receiving token:', tokenResponse.error);
        return;
      }



      
  if (tokenResponse.access_token) {
    accessToken.value = tokenResponse.access_token;
    console.log('Access Token Received:', accessToken.value);
    emit('authenticated');
    fetchCalendarEvents();
  } else {
    console.warn('⚠️ No access token found in response.');
  }

      
      
    },
  });

  console.log('Requesting access token...');
  tokenClient.requestAccessToken({ prompt: 'consent' }); // <-- force consent
};




watchEffect(async () => {
  const token = accessToken.value;
  const localData = props.localData;

  // Only proceed if no accessToken and localData & user.id are available
  if (!token && localData?.user?.id && localData.token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localData.token,
      };

      const response = await axios.get(
        `http://127.0.0.1:8000/api/all_event/${localData.user.id}`,
        { headers }
      );

      if (response.data.data) {
        events.value = response.data.data.map(item => ({
          start: new Date(item.start),
          end: new Date(item.end),
          title: item.title,
        }));
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  } else {
    // Log what's missing to help debug
    console.log('Waiting for required data:', { token, localData });
  }
});


const fetchCalendarEvents = async () => {
  try {
    console.log('Attempting to fetch calendar events with token:', accessToken.value);

    // const now = new Date();
    // const endOfDay = new Date();
    // // endOfDay.setHours(17, 0, 0, 0);
    // endOfDay.setHours(23, 59, 59, 999);


    const now = new Date();
  const sevenDaysLater = new Date();
   sevenDaysLater.setDate(now.getDate() + 7);


  

    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: sevenDaysLater.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log('Raw response items:', response);

  //     const newEvent = {
  //   title:title.value,
  //   start: start,
  //   end: end,
  // };
        const googleEvents = response.result.items.map((event) => ({
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      title: event.summary || '(No Title)',
    }))
   
    events.value = googleEvents
    
    calendarAttributes.value = events.value.map(event => ({
      key: event.id,
      dates: new Date(event.start),
      highlight: {
        backgroundColor: '#42b983',
        borderRadius: '4px',
      },
      popover: {
        label: event.title,
      },
    }));

  } catch (error) {
    console.error('Error fetching events:', error);
    if (error.result) {
      console.error('Error Details:', error.result);
    }
  }
};



function onDayClick(day) {
  alert(`You clicked on ${day.date.toISOString().slice(0, 10)}`)
}

function isSlotAvailable(events, date) {
  const slotStart = new Date(date);
  slotStart.setHours(8, 0, 0, 0);

  const slotEnd = new Date(date);
  slotEnd.setHours(17, 0, 0, 0);


  return !events.value.some(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start); 

    return (
      (eventStart < slotEnd) && (eventEnd > slotStart)
    );
  });
}


const createGoogleCalendarEvent = async (event) => {
  if (!accessToken.value) {
    alert('You must authenticate first!');
    return;
  }

  
  const gcalEvent = {
    summary: event.title,
    start: {
      dateTime: new Date(event.start).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
      
    },
    end: {
      dateTime: new Date(event.end).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: gcalEvent,
    });
    console.log('Event created:', response.result);
    alert('Event successfully added to Google Calendar!');


    // Optionally refresh events to update your calendar UI
    fetchCalendarEvents();
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Failed to create event on Google Calendar');
  }
};



function createWorkdayEvent() {
 const selectedDate = new Date(date.value);
const startHour = selectedDate.getHours(); 
  const start = new Date(selectedDate);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(selectedDate);
  end.setHours(startHour + 1, 0, 0, 0);

  const newEvent = {
    title:title.value,
    start: start,
    end: end,
  };

  if (isSlotAvailable(events, date.value)) {
    events.value.push(newEvent);
    createGoogleCalendarEvent(newEvent);
      console.log(props.localData?.user?.id, props.localData)
     if (props.localData?.user?.id) {


      let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + props.localData?.token,
  }
  let formdata = new FormData()

  formdata.append('title', newEvent.title)
  formdata.append('start', newEvent.start)
    formdata.append('end', newEvent.end)
      formdata.append('user_id', props.localData?.user?.id)
  axios
    .post('http://127.0.0.1:8000/api/create_event', formdata, { headers })
    .then((response) => {
      console.log(response.data)
      if (response.data.message) {
     


      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)
      // if (error.title) {
       
      //   message.value = error.title[0]
      // } else if (error.password) {
      //   message.value = error.password[0]
      // }
    })
       

      } 

    alert('1-hour event created successfully!');
  } else {
    alert('Sorry, this time slot is already taken.');
  }
}



onMounted(async () => {
  try {
    await gapiLoaded();
  } catch (error) {
    console.error("Failed to load Google API:", error);
    // Handle the error appropriately in your UI
  }
});
</script>