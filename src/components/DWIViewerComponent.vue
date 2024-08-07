<template>
      <div v-if="imageMeta" class="image-container bg-black"  :style="{ 'width':width+'px', 'height': height+'px'}">
          <img class="image-ar"   :src="imageUrl"/>
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
      type: Number,
      default: 0,
    },
    imageMeta: {
      type: Object,
    },
    title: {
      type: String,
    },
    baseUrl: {
      type: String,
      default: 'http://localhost:6543/api/v1/dwi'
    },
    sliceIndex: {
      type: Number,
      default: 0,
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
    const image_computed = computed(() => props.imageMeta);
    const base_url_computed = computed(() => props.baseUrl);
    const gradient_computed = computed(() => props.gradientIndex);
    const slice_computed = computed(() => props.sliceIndex);
    const threshold_computed = computed(() => props.threshold);
    watch(image_computed, (nv_ov) => {
      updateImage();
    });
    function updateImage() {
      imageUrl.value = `${props.baseUrl}/${props.imageMeta.filename.replaceAll('/','_')}/${props.gradientIndex}/${props.axisIndex}/${slice_computed.value}?min=${Math.floor(threshold_computed.value.min)}&max=${Math.floor(threshold_computed.value.max)}`;
    }
    watch(threshold_computed,(nv,ov) => {
      updateImage();
    });
    watch(slice_computed, (nv, ov) => {
      updateImage();
    });
    watch(gradient_computed, (nv, ov) => {
      updateImage();
    });
    watch(base_url_computed, (nv, ov) => {
      updateImage();
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      if(props.imageMeta) {
        // sliceIndex.value = 0;
        updateImage();        
      }
    });
    onUnmounted(() => {
    });
    return {
      imageUrl,
    };
  }
});

</script>
<style scoped>
.image-container {
  display:flex;
  position: relative;
  width: 100%;
}
.image-ar {
  display: flex;
  width: 100%;
  position: relative;
  margin: auto;
  padding: auto;
}
</style>