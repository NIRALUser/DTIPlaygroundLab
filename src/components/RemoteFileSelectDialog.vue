<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Select Files</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
           <RemoteFileNavigator v-model="selectedFiles"/>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Select" @click="closeModal(true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <div>
   
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect } from 'vue';
import RemoteFileNavigator from 'src/components/RemoteFileNavigator.vue';

export default defineComponent({
  props: { 
    modelValue: {
      type: Array,
      required: false,
      default: []
    }
  },
  components: { RemoteFileNavigator  },
  setup (props, ctx) {
    const isOpen = ref(false);
    const selectedFiles = ref<any[]>([]);
    function closeModal(save) {
      if (save) {
        ctx.emit('update:modelValue', selectedFiles.value);
      }
      isOpen.value = false
    }
    function openModal() {
      isOpen.value = true
      selectedFiles.value = []
    }
    return {
      isOpen,
      closeModal,
      openModal,
      selectedFiles,
    };
  }
});
</script>
