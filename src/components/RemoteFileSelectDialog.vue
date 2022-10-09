<template>
  <div>
    <q-dialog v-model="isOpen">
      <div class="file-dialog bg-white">
              <div class="dialog-body">
                <div class="col">
                    <div class="q-pa-xs text-h6 bg-primary text-white row">
                      <div class="q-pa-xs text-h5 col-sm-8 col-xs-2" align="left">
<!--                           <q-icon name="folder" color="white"/> -->
                        <q-btn icon="turn_left" flat @click="goUpperDir"/>
                      </div>
                      <div align="right" class="q-pa-xs text-white col-sm-4 col-xs-10">
                          <q-btn flat dense label="Cancel" class="text-white" v-close-popup />
                          <q-btn flat dense label="Select" class="text-white" @click="closeModal(true)" />
                      </div>
                    </div>
                </div>
                <div class="q-pt-none col-10">
                     <RemoteFileNavigator :root="rootDir.val" v-model="selectedFiles"/>
                </div>
              </div>
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect, reactive } from 'vue';
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
    const rootDir = reactive<any>({val: '/'});

    function goUpperDir(ev) {
      rootDir.val = `${rootDir.val}/..`;
    }
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
    onMounted(() => {
      rootDir.val = '/mnt/niral/Zylka/DTI/tests-dmriatlasbuilder/images_dti';
    });
    return {
      isOpen,
      closeModal,
      openModal,
      selectedFiles,
      rootDir,
      goUpperDir,
    };
  }
});
</script>
