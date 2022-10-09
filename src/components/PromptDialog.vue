<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Select Files</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
           <q-input dense v-model="text" autofocus @keyup.enter="closeModal(true)" @keyup.esc="closeModal(false)"/>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="OK" @click="closeModal(true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect } from 'vue';
import RemoteFileNavigator from 'src/components/RemoteFileNavigator.vue';

export default defineComponent({
  props: { 
    modelValue: {
      type: String,
      required: false,
      default: ''
    },
  },
  components: { RemoteFileNavigator  },
  setup (props, ctx) {
    const isOpen = ref(false);
    const text = ref<string>();
    function closeModal(save) {
      if (save) {
        ctx.emit('update:modelValue', text.value);
      }
      isOpen.value = false;
    }
    function openModal(content) {
      isOpen.value = true;
      text.value = content;
    }
    return {
      isOpen,
      text,
      closeModal,
      openModal,
    };
  }
});
</script>
