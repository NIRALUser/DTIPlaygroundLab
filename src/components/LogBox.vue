<template>
  <div class="q-pa-md">
    <div class="q-pa-xs text-subtitle text-bold">{{ title }}</div>
    <q-separator/>
    <div>
      <q-input
        ref="textArea"
        v-model="modelValue"
        type="textarea"
        rows="10"
        readonly
        class="text-caption"
        />
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, ref, reactive, computed} from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: {}
    },
    title: {
      type: String,
      default: 'Execution Log'
    }
  },
  components: { 
  },
  setup (props, ctx) {
    const textArea = ref(null);
    const content = computed(() => props.modelValue);
    const el = ref(null);

    function scrollToEnd() {
        setTimeout(() => {
            el.value.scrollTop = el.value.scrollHeight;
        }, 500); 
    }
    watch(content, () => {
      scrollToEnd();
    });
    onMounted(async () => {
      el.value = textArea.value.$el.querySelector('textarea');
      scrollToEnd();
    });
    return {
      textArea,
      scrollToEnd
    };
  }
});

</script>