<template>
  <q-page>
    <div>
      <p> DTI Playground Home </p>
    </div>
  </q-page>>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect } from 'vue';
import { useGlobalVariables } from 'src/stores/dtiplayground';

export default defineComponent({
  props: [],
  components: { },
  setup (props, ctx) {
    const $g = useGlobalVariables();
    onMounted(() => {
      $g.setApplicationName(null);
    });
    return {};
  }
});

</script>