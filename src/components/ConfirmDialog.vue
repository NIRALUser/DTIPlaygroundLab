<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Confirm</div>
      </q-card-section>
      <q-card-section>
        Are you sure?
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
      type: Boolean,
      required: false,
      default: false
    },
  },
  components: { RemoteFileNavigator  },
  setup (props, ctx) {
    const isOpen = ref(false);
    const text = ref<string>();
    function closeModal(save) { 
      if (save) {
        ctx.emit('update:modelValue', true);
      } else {
        ctx.emit('update:modelValue', false);
      } 
      isOpen.value = false;
    }
    function openModal() {
      isOpen.value = true;
    }
    return {
      isOpen,
      confirm,
      closeModal,
      openModal,
    };
  }
});
</script>
