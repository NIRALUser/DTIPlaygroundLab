<template>
  <div>
   <RemoteFileSelectDialog :extentions="extensions" :root="rootDir" v-on:changed-dir="onChangedDir"  ref="fileDialog" :multiple="multiple" :directory="directory" v-model="selectedFiles.val"/>
   <q-input  :disable="disable" clearable v-model = "singleFile.val" :label="label">
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
    const model_computed = computed(() => props.modelValue);
    const multiple_flag = computed(() => props.multiple);

    watch(model_computed,(nv, ov) => {
      if (!nv) return;
      const split_path = nv.split(',');
      let path_array: any[] = []
      split_path.forEach(path => {
        path_array.push({ path })
      });
      selectedFiles.val = path_array;
    });
    watch(selectedFiles, (nv, ov) => {
      if (selectedFiles.val.length < 1) return;
      if (!multiple_flag.value) singleFile.val = selectedFiles.val[0].path;
      else {
        let mult_paths = '';
        for (let i = 0; i < selectedFiles.val.length; i++) {
          const path = selectedFiles.val[i].path;
          mult_paths += path + ','
        }
        singleFile.val = mult_paths.slice(0, -1);
      }
      ctx.emit('update:modelValue', singleFile.val);
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
      multiple_flag,
    };
  }
});
</script>
