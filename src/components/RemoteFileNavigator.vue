
<template>
  <div class="noselect">
    <p class="truncate"> Current Directory : {{ currentRoot }}</p>
    <ul class="">
      <div v-for="file in files" :key="file.path">
       <template v-if="file.is_dir">
           <div @click="changeRoot(file.path)" class="truncate hover">
               <q-icon name="folder" color="orange"/>
               <a  class='overflow-hidden'>{{ file.name }}</a>
           </div>
       </template>
       <template v-else>
          <div @click.ctrl = "addSelection($event,file)" 
               @click.shift = "addSelectionUntil($event,file)"
               @click.left.exact = "onFileSelected($event,file)" 
               :class =" { 'truncate hover' : true, 'selected' : selectedFiles.map((x) => x.path).includes(file.path) }">
            <q-icon name="description" color="green"/>
            <a >{{ file.name }}</a>
          </div>
       </template>
      </div>
    </ul>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect, watch } from 'vue';
import { useClientStore } from 'src/stores';
import lodash from 'lodash';

export default defineComponent({
  props: {
    modelValue: {
      type: Array,
      required: false,
    },
    cols: {
      type: Number,
      required: false,
      default: 1
    },
    root: {
      type: String,
      required: false,
      default: '/home/scalphunter/Downloads',
    }
  },
  components: {  },
  setup (props, ctx) {
    const client_store = useClientStore();
    const client = ref<any>(null);
    const files = ref<any[]>([]);
    const currentRoot = ref<string>(props.root);
    const selectedFiles = ref<any[]>([]);

    async function changeRoot (rootdir) {
      files.value = [];
      selectedFiles.value = [];
      client.value = await client_store.getClient;
      currentRoot.value = rootdir;
      const resp = await client.value.listFiles(currentRoot.value);
      files.value = resp.data;
    }
    function onFileSelected (ev, file) {
      selectedFiles.value = [];
      selectedFiles.value.push(file);
    }
    function addSelection(ev, file) {
      selectedFiles.value.push(file);
    }
    function addSelectionUntil(ev, file) {
      ev.preventDefault();
      if (selectedFiles.value.length > 0) {
        const previousIndex = files.value.indexOf(selectedFiles.value[selectedFiles.value.length -1]);
        const currentIndex = files.value.indexOf(file);
        let minIdx = Math.min (previousIndex, currentIndex);
        let maxIdx = Math.max (previousIndex, currentIndex);
        if (previousIndex < currentIndex) maxIdx = maxIdx + 1;
        const slice = files.value.slice(minIdx, maxIdx);
        selectedFiles.value = lodash.uniq(selectedFiles.value.concat(slice));
      } else {
        selectedFiles.value.push(file);
      }
    }
    watch(selectedFiles, (n,o) => {
      ctx.emit('update:modelValue', selectedFiles.value);
    });
    onMounted(async () => {
      client.value = await client_store.getClient;
      const resp = await client.value.listFiles(props.root);
      files.value = resp.data;
    });
    return {
      currentRoot,
      files,
      changeRoot,
      onFileSelected,
      addSelection,
      addSelectionUntil,
      selectedFiles,
    };
  }
});
</script>

<style>

.hover {
  color: #0000;
  background: 
    linear-gradient(90deg,#1095c1 50%,#000 0) 
    var(--_p,100%)/200% no-repeat;
  -webkit-background-clip: text;
          background-clip: text;
/*  transition: .1s;*/
}
.hover:hover {
  --_p: 0%;
}

.selected {
  
  opacity: 0.5;
}

</style>