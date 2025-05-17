<template>
   <div class="w-full flex items-center justify-center">
    <div class="w-2/5 m-auto h-48 rounded-md flex flex-col items-center mt-28 gap-6">
      <h2 class="text-2xl text-center text-black"> {{ message || 'Please wait...' }}</h2>
      <button class="text-lg bg-blue-500 rounded-md text-white px-2 py-2" v-if="isconfirm">
        confirm
      </button>
       <button
              @click="() => router.replace({ name: is_true ? 'login' : 'signup' })"
              class="tw-w-full tw-py-2 tw-px-2 tw-rounded-md tw-bg-blue-600 tw-text-white tw-font-medium"
            >
              Click Here
            </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import axios from 'axios'
// import { HomeIcon } from 'vue-feather-icons'
// import { FiHome } from 'vue-icons/fi' 


// Assuming context is provided via provide/inject or a composable


const route = useRoute()
const router = useRouter()

const email = route.query.email
const name = route.query.name

const message = ref('')
const is_true = ref(false)
const is_popup = ref(false)
const isProcessing = ref(false)

onMounted(() => {
  if (email && name) {
    
      const url = `verify_email/?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
      axios.get(`http://127.0.0.1:8000/api/${url}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => {
        if (res.data.success) {
          message.value = res.data.success
          is_true.value = res.data.status
        } else {
          message.value = res.data.error
          is_true.value = res.data.status
        }
      })
  
  }
})
</script>
