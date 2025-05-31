

<template>
  <div class="my-4 gap-3">

   
    <section class="w-full  m-auto rounded gap-2 flex flex-col items-center mt-3">
        <!-- <button
      v-if="gapiInited"
      @click="handleAuthClick"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Connect Google Calendar
    </button>
    <div v-else>Loading Google API...</div> -->

        <vue-cal
      v-if="events.length"
      :events="events"
      :views="['day', 'week']"
      style="height:500px; width:900px"
      @event-click="onEventClick"
    />
     <div v-if="selectedEvent" class="modal rounded-sm flex flex-col w-1/4">
      <section class="w-full ">
        <span class="w-20 text-center float-right text-black cursor-pointer" @click="selectedEvent = null">x</span>
      </section>
      <h3>{{ selectedEvent.title }}</h3>
      <p>{{ selectedEvent.content }}</p>
      <p><strong>Start:</strong> {{ selectedEvent.start.toLocaleString('en-US', {
      weekday: 'long', 
      year: 'numeric',   
      month: 'long',   
      day: 'numeric',    
      hour: 'numeric',   
      minute: 'numeric',
     }) }}</p>
      <p><strong>End:</strong> {{ selectedEvent.end.toLocaleString('en-US', {
      weekday: 'long', 
      year: 'numeric',   
      month: 'long',   
      day: 'numeric',    
      hour: 'numeric',   
      minute: 'numeric',
     }) }}</p>
      <p><strong>status:</strong>{{ selectedEvent.taken_by?"Taken":'Available' }}</p>
      <button  v-if="selectedEvent.taken_by" class="hidden"   @click="createWorkdayEvent">Close</button>
         <button  v-if="!accessToken" class="bg-green-400 rounded-md py-2 px-2 text-center capitalize" @click="handleAuthClick"  >Connect Google Calendar</button>
        <button  v-if="accessToken" class="bg-green-400 rounded-md py-2 px-2 text-center capitalize" :disabled="isbook" @click="createWorkdayEvent"  >{{ selectedEvent.taken_by?"Cancel Appointment":isbook?"Please wait":"Book Appointment" }} </button>

    </div>
   

     <!-- <VueDatePicker
     v-model="date"
    :enable-time-picker="true"
    :min-time="{ hours: 8, minutes: 0 }"
    :max-time="{ hours: 17, minutes: 0 }"
    :min-date="today"
    :minutes-increment="60"
    :is-24="false"
    :auto-apply="true"
    placeholder="Select appointment time"
      /> -->


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
  
   const isbook = ref(false)
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
const CLIENT_ID = '488789857181-di31lrs85jst4j4u3580cdnkuehon18t.apps.googleusercontent.com'; 
const API_KEY = 'AIzaSyCpTUEZrbV54_B-UKIotYTdFLt79Xajsns';     
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar openid email profile';
const calendarAttributes = ref([])

let tokenClient;


const selectedEvent = ref(null)

function onEventClick(event) {
  selectedEvent.value = event
}





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
  let google_oauth_data =  localStorage.getItem('google_oauth')?JSON.parse(localStorage.getItem('google_oauth')):null
  if(google_oauth_data && google_oauth_data.accessToken){

  }else{

   tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async(tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Error receiving token:', tokenResponse.error);
        return;
      }
   
  if (tokenResponse.access_token) {
    accessToken.value = tokenResponse.access_token;
    console.log('Access Token Received:', accessToken.value);
    emit('authenticated');
    // fetchCalendarEvents();
      try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });

      const user = await res.json();
      console.log('User Email:', user);
      let obj_oauth = {
        email:user.email,
        accessToken:tokenResponse.access_token
      }
      localStorage.setItem('google_oauth', JSON.stringify(obj_oauth))


     
      if(!selectedEvent.value.taken_by){
      isbook.value = true
              let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let formdata = new FormData()

  formdata.append('email', user.email)
  formdata.append('id', parseInt(selectedEvent.value.id))
  axios
    .post('http://127.0.0.1:8000/api/create_task', formdata, { headers })
    .then((response) => {
     
      if (response.data.success) {
          createGoogleCalendarEvent(selectedEvent.value, selectedEvent.value.id);
     
        // alert(response.data.success);

      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)

    })

      }else{
          isbook.value = true
                let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let formdata = new FormData()

  formdata.append('email', user.email)
  formdata.append('id', parseInt(selectedEvent.value.id))
   formdata.append('_method', 'PUT')
  axios
    .post('http://127.0.0.1:8000/api/cancel_appointment', formdata, { headers })
    .then((response) => {
     
      if (response.data.success) {
          // createGoogleCalendarEvent(selectedEvent.value, selectedEvent.value.id);
            fetch_calendar_data()  
          const eventId = selectedEvent.value.google_calender_id; // or from localStorage/db

fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken.value}`,
  },
})
  .then((res) => {
    if (res.status === 204) {
      alert('Event was successfully deleted from Google Calendar!');
      selectedEvent.value = null
    } else {
      return res.json().then(data => {
        console.error('Failed to delete event:', data);
        alert('Failed to delete event.');
      });
    }
  })
  .catch(err => {
    console.error('Error deleting event:', err);
    alert('Error deleting event.');
  });

      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)

    })


      }




    } catch (err) {
      console.error('Failed to get user info:', err);
    }
  } else {
    console.warn('No access token found in response.');
  } 
    },
  });

  tokenClient.requestAccessToken({ prompt: 'consent' }); 

  }



};




watchEffect(async () => {
  const token = accessToken.value;
  const localData = props.localData;

  // Only proceed if no accessToken and localData & user.id are available

    try {
      const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + localData.token,
      };

      const response = await axios.get(
        `http://127.0.0.1:8000/api/calender_events`,
        { headers }
      );
       console.log(response.data)
      if (response.data.success) {
        events.value = response.data.success.map(item => ({
          id:item.id,
          title:`${item.lastname} ${item.firstname}`,
          start: new Date(item.time_from),
          end: new Date(item.time_to),
          content:`${item.title}`,
          taken_by:item.taken_by == null?false:true,
          google_calender_id:item.google_calender_id,
          class: item.taken_by ? 'taken-event' : 'free-event'
        }));
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }

     let google_oauth_data =  localStorage.getItem('google_oauth')?JSON.parse(localStorage.getItem('google_oauth')):null

       if(google_oauth_data && google_oauth_data.accessToken){
           accessToken.value = google_oauth_data.accessToken
       }

});


const fetch_calendar_data = async()=>{
     try {
      const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + localData.token,
      };

      const response = await axios.get(
        `http://127.0.0.1:8000/api/calender_events`,
        { headers }
      );
       console.log(response.data)
      if (response.data.success) {
        events.value = response.data.success.map(item => ({
          id:item.id,
          title:`${item.lastname} ${item.firstname}`,
          start: new Date(item.time_from),
          end: new Date(item.time_to),
          content:`${item.title}`,
          taken_by:item.taken_by == null?false:true,
          google_calender_id:item.google_calender_id,
          class: item.taken_by ? 'taken-event' : 'free-event'
        }));
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
}


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


const createGoogleCalendarEvent = async (event, id) => {
  if (!accessToken.value) {
    alert('You must authenticate first!');
    return;
  }

  
  const gcalEvent = {
    summary: event.title,
     description: event.content || 'No additional details provided.',
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
    // const response = await gapi.client.calendar.events.insert({
    //   calendarId: 'primary',
    //   resource: gcalEvent,
    // });
    // console.log('Event created:', response.result);
    // const eventId = response.result.id;
    // alert('Event successfully added to Google Calendar!');


    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken.value}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(gcalEvent),
})
  .then((res) => res.json())
  .then((data) => {
  const eventId = data.id

           let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let formdata = new FormData()

  formdata.append('google_calender_id', eventId)
  formdata.append('id', selectedEvent.value.id)
  axios
    .post('http://127.0.0.1:8000/api/add_google_id_task', formdata, { headers })
    .then((response) => {
     
      if (response.data.success) {
       isbook.value = false
       selectedEvent.value = null
       fetch_calendar_data()
        alert(response.data.success);

      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)

    })
  
  })
  .catch((err) => {
    console.error('Error creating event:', err);
    alert('Failed to create event on Google Calendar');
  });

 


    // Optionally refresh events to update your calendar UI
    // fetchCalendarEvents();
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Failed to create event on Google Calendar');
  }
};



function createWorkdayEvent() {
isbook.value = true
let google_oauth_data =  localStorage.getItem('google_oauth')?JSON.parse(localStorage.getItem('google_oauth')):null

if(selectedEvent.value.taken_by){

        let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let formdata = new FormData()

  formdata.append('email', google_oauth_data.email)
  formdata.append('id', parseInt(selectedEvent.value.id))
  formdata.append('_method', 'PUT')
  axios
    .post('http://127.0.0.1:8000/api/cancel_appointment', formdata, { headers })
    .then((response) => {
     
      if (response.data.success) {
          // createGoogleCalendarEvent(selectedEvent.value, selectedEvent.value.id);
            fetch_calendar_data()  
          const eventId = selectedEvent.value.google_calender_id; 

fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken.value}`,
  },
})
  .then((res) => {
    if (res.status === 204) {
      console.log('Event deleted successfully.');
      alert('Event was successfully deleted from Google Calendar!');
    } else {
      return res.json().then(data => {
        console.error('Failed to delete event:', data);
        alert('Failed to delete event.');
      });
    }
  })
  .catch(err => {
    console.error('Error deleting event:', err);
    alert('Error deleting event.');
  });

      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)

    })


}else{
      let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let formdata = new FormData()

  formdata.append('email', google_oauth_data.email)
  formdata.append('id', parseInt(selectedEvent.value.id))
  axios
    .post('http://127.0.0.1:8000/api/create_task', formdata, { headers })
    .then((response) => {
     
      if (response.data.success) {
          createGoogleCalendarEvent(selectedEvent.value, selectedEvent.value.id);
     
        // alert(response.data.success);
          fetch_calendar_data()

          

      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      console.log(error)

    })
  }
       
}



onMounted(async () => {
  try {
    await gapiLoaded();
  } catch (error) {
    console.error("Failed to load Google API:", error);
    // Handle the error appropriately in your UI
  }

   setTimeout(() => {
    localStorage.removeItem('google_oauth')
  }, 40 * 60 * 1000)
});
</script>


<style>
.modal {
  position: fixed;
  top: 20%;
  left: 20%;
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  z-index: 1000;
}

.vuecal__event.taken-event {
  background-color: #ff4d4d !important;
  color: white;
}

.vuecal__event.free-event {
  background-color: #4dff4d !important;
  color: black;
}
</style>








