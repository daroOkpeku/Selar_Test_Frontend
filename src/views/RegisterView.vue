<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AES, enc } from 'crypto-js'
const router = useRouter()
import axios from 'axios'
const firstname = ref('')
const lastname = ref('')
const isprocessing = ref(false)
const email = ref('')
const password = ref('')
const message = ref('')
const localData = ref({})
const handleSubmit = () => {
  isprocessing.value = true
  let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  let formdata = new FormData()
  formdata.append('name', firstname.value)
  formdata.append('email', email.value)
  formdata.append('password', password.value)
  axios
    .post('http://127.0.0.1:8000/api/register', formdata, { headers })
    .then((response) => {
      console.log(response.data)
      if (response.data.message) {
        isprocessing.value = false
        message.value = response.data.message
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 1500)
      }
    })
    .catch((err) => {
      let error = err.response.data.errors
      if (error.name) {
        isprocessing.value = false
        message.value = error.name[0]
      }  else if (error.email) {
        isprocessing.value = false
        message.value = error.status[0]
      } else if (error.password) {
        isprocessing.value = false
        message.value = error.password[0]
      }
    })
}

onMounted(() => {
  // Check if window and localStorage are available

  const userInfo = localStorage.getItem('userinfo')
  console.log(userInfo)
  if (userInfo) {
    // Decrypt and parse the user info
    const decryptedData = AES.decrypt(userInfo, 'HEALTH').toString(enc.Utf8)
    console.log(decryptedData)
    try {
      // Parse and assign the decrypted data to localData
      localData.value = JSON.parse(decryptedData)
      console.log(localData.value.token)
      setTimeout(() => {
        router.push({ name: 'home' })
      }, 1500)
    } catch (e) {
      console.error('Error parsing decrypted data:', e)
      localData.value = {} // Fallback to an empty object in case of parsing error
    }
  } else {
    localData.value = {} // Fallback if no data is in localStorage
  }
})

const handleHere = () => {
  router.push({ name: 'login' })
}
</script>
<template>
  <div class="w-full flex items-center justify-center">
    <section
      class="w-3/4 rounded-md border-2 py-4 flex flex-col items-center justify-center gap-4 mt-16"
    >
      <div class="w-3/4 flex flex-col items-center text-lg text-black" v-if="message">
        {{ message }}
      </div>
      <div class="w-3/4 flex flex-col items-center text-lg">Register</div>
      <div class="w-3/4 flex flex-col items-center">
        <article class="w-11/12 flex flex-col items-center">
          <section class="w-full text-left text-lg capitalize">FullName</section>
          <article class="w-full">
            <input type="text" v-model="firstname" class="w-full p-2 rounded-md border" />
          </article>
        </article>
      </div>


      <div class="w-3/4 flex flex-col items-center">
        <article class="w-11/12 flex flex-col items-center">
          <section class="w-full text-left text-lg capitalize">email</section>
          <article class="w-full">
            <input type="text" v-model="email" class="w-full p-2 rounded-md border" />
          </article>
        </article>
      </div>

      <div class="w-3/4 flex flex-col items-center">
        <article class="w-11/12 flex flex-col items-center">
          <section class="w-full text-left text-lg capitalize">password</section>
          <article class="w-full">
            <input type="password" v-model="password" class="w-full p-2 rounded-md border" />
          </article>
        </article>
      </div>

      <div class="w-3/4 flex flex-col items-center">
        <article class="w-11/12 flex flex-col items-center">
          <button
            class="w-full py-2 rounded-md bg-blue-600 text-white text-center flex items-center justify-center"
            @click="handleSubmit"
          >
            <span v-if="isprocessing">{{ 'Please wait...' }}</span>
            <span v-else>{{ 'Submit' }}</span>
          </button>
        </article>
      </div>
      <div class="w-full flex items-center justify-center">
        <section class="w-3/4 flex items-center justify-center space-x-2 cursor-pointer">
          <span>i have an account</span
          ><span @click="handleHere()" class="text-blue-300">click here</span>
        </section>
      </div>
    </section>
  </div>
</template>
