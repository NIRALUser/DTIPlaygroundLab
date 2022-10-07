<template>
  <div class="q-pa-none truncate" v-if="modelValue">
    <div v-if="modelValue.files.length > 0">Files in {{ modelValue.label }}</div>
    <q-list dense separator>
      <q-item clickable v-ripple v-for="file in modelValue.files" :key="file">
        <div class="row text-caption">
          <q-item-section side><q-icon clickable name="delete" color="red" @click="deleteItem(modelValue.id, file)"/></q-item-section>
          <q-item-section>
            {{ file.split('/').reverse()[0] }}
          </q-item-section>
          <q-tooltip>
            {{ file }}
          </q-tooltip>
        </div>
      </q-item>
    </q-list>
  </div>
</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watchEffect, computed, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: {}
    }
  },
  components: { },
  setup (props, ctx) {
    const data = ref<any[]>([]);
    function deleteItem(node_id, file) {
      ctx.emit('fileRemoved', { id: node_id, file });
    }
    return { 
      data,
      deleteItem,
    }
  }
});

</script>