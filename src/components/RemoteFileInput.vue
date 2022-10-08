<template>
  <div>
   <RemoteFileSelectDialog ref="fileDialog" v-model="selectedFiles.val"/>
   <q-input clearable v-model = "singleFile.val" :label="label">
      <template v-slot:append>
        <q-icon name="attach_file" @click="openDialog"/>
      </template>
   </q-input>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watch, reactive } from 'vue';
import RemoteFileSelectDialog from 'src/components/RemoteFileSelectDialog.vue';

export default defineComponent({
  props: { 
    modelValue: {
      type: String,
      required: false,
      default: null
    },
    label: {
      type: String,
      default: 'File Name'
    }
  },
  components: { RemoteFileSelectDialog  },
  setup (props, ctx) {
    const selectedFiles = reactive<any>({val: null});
    const fileDialog = ref(null);
    const singleFile = reactive<any>({val: null});
    watch(selectedFiles, (nv, ov) => {
      ctx.emit('update:modelValue', selectedFiles.val[0].path);
      singleFile.val = selectedFiles.val[0].path;
      console.log(selectedFiles.val);
    });
    function openDialog(){
      fileDialog.value.openModal();
    }
    return {
      selectedFiles,
      fileDialog,
      openDialog,
      singleFile,
    };
  }
});
</script>
