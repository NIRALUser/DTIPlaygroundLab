
<template>
  <div class="noselect q-pa-md">
    <div class="col">
        Current Directory : {{ currentRoot }}
    </div>
    <div>
          <div class="truncate row"> 
            <div :class="{ 'col-md-3 col-sm-6 col-xs-12' : !singlecolumn, 'col-12': singlecolumn }" v-for="file in files" :key="file.path">
             <template v-if="file.is_dir">
                 <div @click="addSelection($event, file)"
                      @click.ctrl = "addSelection($event,file)" 
                      @click.shift = "addSelectionUntil($event,file)"
                      @click.left.exact = "onFileSelected($event,file)"  
                      @dblclick="changeRoot(file.path)"
                      :class =" { 'truncate hover' : true, 'selected' : selectedFiles.map((x) => x.path).includes(file.path) }">
                     <q-icon name="folder" color="orange"/>
                     <a  class='overflow-hidden'>{{ file.name }}</a>
                 </div>
             </template>
             <template v-else>
                <div @click.ctrl = "addSelection($event,file)" 
                     @click.shift = "addSelectionUntil($event,file)"
                     @click.left.exact = "onFileSelected($event,file)" 
                     @dblclick="$emit('open-file',file.path)"
                     :class =" { 'truncate hover' : true, 'selected' : selectedFiles.map((x) => x.path).includes(file.path) }">
                  <q-icon name="description" color="green"/>
                  <a >{{ file.name }}</a>
                </div>
             </template>
            </div>
          
         </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watchEffect, watch } from 'vue';
import { useClientStore } from 'src/stores/dtiplayground.ts';
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
      default: '/',
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
    extensions: {
      type: Array,
      default: null,
    },
    singlecolumn: {
      type: Boolean,
      default: false,
    }
  },
  components: {  },
  setup (props, ctx) {
    const $c = useClientStore();
    const files = ref<any[]>([]);
    const currentRoot = ref<string>(props.root);
    const selectedFiles = ref<any[]>([]);
    const root_computed = computed(() => props.root);

    async function changeRoot (rootdir) {
      files.value = [];
      selectedFiles.value = [];
      const client = await $c.client;
      currentRoot.value = rootdir;
      const resp = await client.listFiles(currentRoot.value);
      files.value = resp.data;
      ctx.emit('changed-dir', currentRoot.value);
      ctx.emit('update:root', currentRoot.value);
    }
    function onFileSelected (ev, file) {
      selectedFiles.value = [];
      if (!props.directory && file.is_dir) return;
      if (props.directory && !file.is_dir) return;
      if (!file.is_real) return;

      selectedFiles.value.push(file);
    }
    function addSelection(ev, file) {
      if (!props.multiple) return
      if (!props.directory && file.is_dir) return;
      if (!file.is_real) return;
      selectedFiles.value.push(file);
    }
    function addSelectionUntil(ev, file) {
      if (!props.multiple) return;
      ev.preventDefault();
      let flist = []
      if (selectedFiles.value.length > 0) {
        const previousIndex = files.value.indexOf(selectedFiles.value[selectedFiles.value.length -1]);
        const currentIndex = files.value.indexOf(file);
        let minIdx = Math.min (previousIndex, currentIndex);
        let maxIdx = Math.max (previousIndex, currentIndex);
        if (previousIndex < currentIndex) maxIdx = maxIdx + 1;
        const slice = files.value.slice(minIdx, maxIdx);
        flist = lodash.uniq(selectedFiles.value.concat(slice));
      } else {
        flist.push(file);
      }
      if (!props.directory) {
        flist = flist.filter((x) => !x.is_dir && x.is_real);
      }
      selectedFiles.value = flist;
    }

    watch(selectedFiles, (n,o) => {
      ctx.emit('update:modelValue', selectedFiles.value);
    });
    watch(root_computed, (nv, ov)=> {
      console.log(nv);
      changeRoot(nv);
    });
    onMounted(async () => {
      const client= await $c.client;
      const resp = await client.listFiles(props.root);
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
.scroll-y {
  height: 100%;
  overflow-y: auto;
}
</style>