<template>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, ref, reactive, computed} from 'vue';
import { useGlobalNotification } from 'src/stores/dtiplayground';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

export default defineComponent({
  components: { 
  },
  setup (props, ctx) {
    const $n = useGlobalNotification();
    const $q = useQuasar();
    const { message } = storeToRefs($n);
    watch(message, () => {
      $q.notify(message.value);
    });
    onMounted(async () => {
    });
    return {
    };
  }
});

</script>