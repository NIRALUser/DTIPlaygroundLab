<template>
  <div>
   <RemoteFileSelectDialog :extentions="extensions" :root="rootDir" v-on:changed-dir="onChangedDir"  ref="fileDialog" :multiple="multiple" :directory="directory" v-model="selectedFiles.val"/>
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
import { ParentNameFromPath } from 'src/utils';

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
    },
    root: {
      type: String,
      default: '/'
    },
    extensions: {
      type: Array,
      default: null
    }
  },
  components: { RemoteFileSelectDialog  },
  setup (props, ctx) {
    const selectedFiles = reactive<any>({val: []});
    const fileDialog = ref(null);
    const singleFile = reactive<any>({val: props.modelValue});
    const rootDir = ref<string>(props.root);
    const root_computed = computed(() => props.root);
    watch(selectedFiles, (nv, ov) => {
      if (selectedFiles.val.length < 1) return;
      ctx.emit('update:modelValue', selectedFiles.val[0].path);
      singleFile.val = selectedFiles.val[0].path;
    });
    function openDialog(){
      if (singleFile.val) {
        if (singleFile.val.trim() !== '')
        {
          // const tmp = singleFile.val.split('/');
          // const parent = tmp.splice(0,tmp.length-1).join('/');
          // const name = tmp[tmp.length-1];
          const [ parent, name ] = ParentNameFromPath(singleFile.val);
          rootDir.value = parent;          
        }
      }
      fileDialog.value.openModal();
    }
    function onChangedDir(ev) {
      rootDir.value = ev;
      ctx.emit('changed-dir', ev);
    }
    watch(root_computed, (nv, ov) => {
      rootDir.value = root_computed.value;
    });
    watch(singleFile, (nv, ov) => {
      ctx.emit('update:modelValue', singleFile.val);
    });
    onMounted(() => {
      singleFile.val = props.modelValue;
    });
    return {
      selectedFiles,
      fileDialog,
      openDialog,
      singleFile,
      onChangedDir,
      rootDir,
    };
  }
});
</script>
