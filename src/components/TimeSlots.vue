<template>
  <div>
    <ul>
      <li v-for="slot in timeSlots" :key="slot.id">{{ slot.startTime }} - {{ slot.endTime }}</li>
    </ul>
    <button @click="addSlot">Add New Slot</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Reactive state
const timeSlots = reactive([
  { id: 1, startTime: '9:00 AM', endTime: '9:30 AM' },
  { id: 2, startTime: '9:30 AM', endTime: '10:00 AM' },
]);

// Ref for a new slot object (you might have a form for this)
const newSlot = ref({ startTime: '', endTime: '' });

// Method to add a new time slot
const addSlot = () => {
  const nextId = timeSlots.length > 0 ? timeSlots[timeSlots.length - 1].id + 1 : 1;
  timeSlots.push({ ...newSlot.value, id: nextId });
  // Optionally reset the newSlot ref
  newSlot.value = { startTime: '', endTime: '' };
};

// You can define computed properties, watchers, lifecycle hooks here as well

// Expose the reactive state and methods to the template
defineExpose({
  timeSlots,
  addSlot,
});
</script>

<style scoped>
/* Your component-specific CSS styles go here */
li {
  margin-bottom: 5px;
}
</style>