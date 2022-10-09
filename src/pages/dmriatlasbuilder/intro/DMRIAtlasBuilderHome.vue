<template>
  <div class="column">
    <div class="col-1"> Hello DMRI Atlas Builder</div>
    <div class="col-1">
      <q-btn @click="removeStorage">Remove Storage</q-btn>
    </div>
  </div>  

</template>

<script lang='ts'>

import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  props:{},
  components:{},
  setup(props, ctx) {

    function removeStorage(ev) {
      localStorage.removeItem('dtiab-tree');
    }
    return {
      removeStorage
    };
  }
})
</script>