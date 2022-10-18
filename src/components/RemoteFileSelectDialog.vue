<template>
  <div>
    <q-dialog v-model="isOpen">
      <div class="file-dialog bg-white">
              <div class="dialog-body">
                <div class="col">
                    <div class="q-pa-xs text-h6 bg-primary text-white row">
                      <div class="q-pa-xs text-h5 col-sm-8 col-xs-2" align="left">
<!--                           <q-icon name="folder" color="white"/> -->
                        <q-btn icon="turn_left" flat @click="goUpperDir(root)"/>
                      </div>
                      <div align="right" class="q-pa-xs text-white col-sm-4 col-xs-10">
                          <q-btn flat dense label="Cancel" class="text-white" v-close-popup />
                          <q-btn flat dense label="Select" class="text-white" @click="closeModal(true)" />
                      </div>
                    </div>
                </div>
                <div class="q-pt-none col-10">
                     <RemoteFileNavigator ref="fileNavigator" :root="root" :directory="directory" :multiple="multiple" v-model="selectedFiles" v-on:changed-dir="onChangedDir" :extensions="extensions"/>
                </div>
              </div>
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect, reactive } from 'vue';
import RemoteFileNavigator from 'src/components/RemoteFileNavigator.vue';
import { ParentNameFromPath } from 'src/utils';

export default defineComponent({
  props: { 
    modelValue: {
      type: Array,
      required: false,
      default: []
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    directory: {
      type: Boolean,
      required: false,
      default: false,      
    },
    root: {
      type: String,
      required: false,
      default: '/'
    },
    extensions: {
      type: Array,
      default: null
    }
  },
  components: { RemoteFileNavigator  },
  setup (props, ctx) {
    const isOpen = ref(false);
    const selectedFiles = ref<any[]>([]);
    const fileNavigator =ref(null);

    function onChangedDir(ev) {
      ctx.emit('changed-dir', ev);
    }
    
    function goUpperDir(ev) {
      const [ newdir, name ] = ParentNameFromPath(props.root);
      fileNavigator.value.changeRoot(newdir);
      onChangedDir(newdir);
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
    });
    return {
      isOpen,
      closeModal,
      openModal,
      selectedFiles,
      goUpperDir,
      onChangedDir,
      fileNavigator,
    };
  }
});
</script>
