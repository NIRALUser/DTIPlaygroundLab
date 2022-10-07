<template>
  <div class="container grid grid-cols-2 mx-auto text-xl select-none">
<!--     <FileSelectDialog ref="fileDialog" v-model="selectedFiles"/> -->
    <div class="">
      <p> DMRI Prep </p>
      <button class="bg-purple-200" @click="showDialog">Open File</button>
    </div>

  </div>
</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watchEffect, computed, watch } from 'vue';
import { download } from 'src/utils';
// import FileSelectDialog from '@/components/FileSelectDialog.vue';


export default defineComponent({
  components: {  },
  setup (props, ctx) {
    const data = ref<any>({});
    const selectedFiles = ref<any[]>([]);
    const fileDialog = ref(null);

    function showDialog() {
      fileDialog.value.openModal();
    }
    watch(selectedFiles, (nv,ov) => {
      console.log(nv);
    });
    watchEffect(() => {
      // console.log(files.value);
    });
    return {
      showDialog,
      fileDialog,
      selectedFiles,
    }
  }
});

</script>