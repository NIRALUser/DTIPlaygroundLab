<template>
  <div>
   <RemoteFileSelectDialog ref="fileDialog" :multiple="multiple" :directory="directory" v-model="selectedFiles.val"/>
   <q-input  :disable="multiple || disable" clearable v-model = "singleFile.val" :label="label">
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
    },
    directory: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  components: { RemoteFileSelectDialog  },
  setup (props, ctx) {
    const selectedFiles = reactive<any>({val: []});
    const fileDialog = ref(null);
    const singleFile = reactive<any>({val: props.modelValue});
    watch(selectedFiles, (nv, ov) => {
      if (selectedFiles.val.length < 1) return;
      ctx.emit('update:modelValue', selectedFiles.val[0].path);
      singleFile.val = selectedFiles.val[0].path;
      console.log(selectedFiles.val);
    });
    function openDialog(){
      fileDialog.value.openModal();
    }
    watch(singleFile, (nv, ov) => {
      ctx.emit('update:modelValue', singleFile.val);
    });
    onMounted(() => {
      singleFile.val = props.modelValue
    });
    return {
      selectedFiles,
      fileDialog,
      openDialog,
      singleFile,
    };
  }
});
</script>
