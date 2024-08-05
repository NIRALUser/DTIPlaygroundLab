<template>
  <div v-if="imageMeta" class="q-pa-md" :style="{ 'min-height':'100vh', 'width':'100%' }">
      <q-markup-table
      flat bordered
      virtual-scroll
      :rows="image_rows">
      <template v-for="(row, inde) in image_rows" :key="inde">
        <tr>
          <td v-for="(elem, index) in row" :key="elem">
            <img class="image-ar" :src="elem" @click="imageSelect(index)" @click.shift="imageZoom(index)" :id="'image_' + index"/>
            <div :style="{'text-align':'center', 'font-weight':'bold', 'background-color': (selected_images?.includes(Number(index))) ? '#1976D2' : 'white'}">DWI {{ index }}</div>
            <q-item-section>
              <q-range thumb-size="13px" @update:model-value="singleImageThresh($event, index)" :min="image_computed.meta.info.volume_display_ranges[Number(index)][0]" :max="image_computed.meta.info.volume_display_ranges[Number(index)][1]"/>
            </q-item-section>
          </td>
        </tr>
      </template>

      </q-markup-table>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import { storeToRefs } from 'pinia';
import { useDMRIVolumeSelector_DWIVolumeSelector } from 'src/stores/dmrivolumeselector';
import { stringify } from 'querystring';

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
num_col: {
  type: Number,
  defualt: 5,
},
selected_images: {
  type: Array,
  defualt: [],
},
},
components: { 
          },
setup (props, ctx) {
const $r = useDMRIVolumeSelector_DWIVolumeSelector();
const imageUrl = ref<string|null>(null);
const image_computed = computed(() => props.imageMeta);
const base_url_computed = computed(() => props.baseUrl);
const slice_computed = computed(() => props.sliceIndex);
const number_col = computed(() => props.num_col);
// const pagination =  { rowsPerPage: 0 };
const image_rows = ref<any>([]);
const selected_images = computed(() => props.selected_images);
const display_single = ref(false);
const current_image = ref<any>({ id: 0, src: '' });
let image_urls: any[] = [];
const zoom = ref(0);
const image_wh = ref([0, 0]);
let initial_wh = [0, 0];
watch(image_computed, (nv_ov) => {
  populateTable();
});


function populateTable() {
  if(props.imageMeta) {
    image_urls = [];
    const image_url: any[] = [];
    let iter_image : any = {};
    for (let i = 0; i < props.imageMeta.meta.gradients.length; i += 1) {
      const img_value = `${props.baseUrl}/${props.imageMeta.filename.replaceAll('/','_')}/${i}/${props.axisIndex}/${slice_computed.value}?min=${props.imageMeta.meta.info.volume_display_ranges[i][0]}&max=${props.imageMeta.meta.info.volume_display_ranges[i][1]}`;
      if (image_wh.value[0] === 0) {
        const image = new Image();
        image.onload = function() {
          const wh = [image.width, image.height];
          initial_wh = wh;
          image_wh.value = wh;
        }
        image.src = `${img_value}`;
      }
      image_urls.push(img_value);
      iter_image[i] = img_value;
      if ((i + 1) % number_col.value === 0) {
        image_url.push(iter_image)
        iter_image = {};
      }
    }
    if (Object.keys(iter_image).length > 0) image_url.push(iter_image);
    image_rows.value = image_url;
  }
}

function slideZoom(ev) {
  const factor = 1 * ev;
  const new_value = [initial_wh[0] * factor, initial_wh[1] * factor]
  image_wh.value = new_value;
}

function imageZoom(ind: number) {
  const selected = image_urls[ind];
  current_image.value = { id: String(ind), src: selected };
  display_single.value = true;
}

function imageSelect(index: number) {
  ctx.emit('selected', Number(index));
}

function singleImageThresh(event: any, index: number) {
  const image = document.getElementById(`image_${index}`);
  if (image) {
    const src = image.getAttribute('src');
    const updatedUrl = src!.replace(/min=\d+/, `min=${event.min}`).replace(/max=\d+/, `max=${event.max}`);
    image.setAttribute('src', updatedUrl);
  }
}
watch(selected_images,(nv,ov) => {
  console.log(nv);
});
watch(slice_computed, (nv, ov) => {
  populateTable();
});
watch(base_url_computed, (nv, ov) => {
  populateTable();
});
watch(number_col, (nv, ov) => {
  populateTable();
});
onBeforeMount(async () => {
});
onMounted(async () => {
  if(props.imageMeta) {
    // sliceIndex.value = 0;
    populateTable();    
  }
  const div = document.getElementById('remove_max');
});
onUnmounted(() => {
});
return {
  imageUrl,
  image_rows,
  selected_images,
  display_single,
  current_image,
  zoom,
  image_wh,
  image_computed,
  imageSelect,
  imageZoom,
  slideZoom,
  singleImageThresh,
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
.my-sticky-dynamic {
  height: 410px
}
.remove_max {
  max-width: none !important;
}

</style>