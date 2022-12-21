<template>
  <div class="q-pa-auto row">
    <div class="col-12">
      <div v-if="imageMeta">
          <img :width="width" :height="height" :src="imageUrl"/>
          <q-item>
            <q-item-section side>
              Axis {{axisIndex}}
            </q-item-section>
            <q-item-section>
              <q-slider v-model="sliceIndex" :min="0" :max="imageMeta.meta.info.sizes[axisIndex]-1" label />
            </q-item-section>
          </q-item>
      </div>

    </div>

  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import { storeToRefs } from 'pinia';
import { useDMRIViewer_TractViewer, useDMRIViewer_DWIViewer } from 'src/stores/dmriviewer';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
    imageMeta: {
      type: Object,
    },
    baseUrl: {
      type: String,
      default: 'http://localhost:6543/api/v1/dwi'
    },
    gradientIndex: {
      type: Number,
      default: 0,
    },
    axisIndex: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
    threshold: {
      type: Object,
    }
  },
  components: { 
              },
  setup (props, ctx) {
    const $r = useDMRIViewer_DWIViewer();
    const imageUrl = ref<string|null>(null);
    const sliceIndex = ref<number>(null);
    const image_computed = computed(() => props.imageMeta);
    const gradient_computed = computed(() => props.gradientIndex);
    const threshold_computed = computed(() => props.threshold);
    watch(image_computed, (nv_ov) => {
      sliceIndex.value = 0;
      updateImage();
    });
    function updateImage() {
      imageUrl.value = `${props.baseUrl}/${props.imageMeta.filename.replaceAll('/','_')}/${props.gradientIndex}/${props.axisIndex}/${sliceIndex.value}?min=${threshold_computed.value.min}&max=${threshold_computed.value.max}`;
    }
    watch(threshold_computed,(nv,ov) => {
      updateImage();
    });
    watch(gradient_computed, (nv, ov) => {
      updateImage();
    });
    watch(sliceIndex, (nv,ov) => {
      updateImage();
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      if(props.imageMeta) {
        sliceIndex.value = 0;
        updateImage();        
      }
    });
    onUnmounted(() => {
    });
    return {
      sliceIndex,
      imageUrl,
    };
  }
});

</script>
<style scoped>

</style>