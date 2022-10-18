<template>
  <div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-black text-white shadow-2"
        >
              <q-tab name="about" icon="info_outline"><div class="q-pa-sm text-bold gt-sn">About</div></q-tab>
              <q-tab name="docs" icon="content_copy"><div class="q-pa-sm text-bold gt-sm">Documentations</div></q-tab>
        </q-tabs>
      </div>
      <q-separator/>                     
      <q-tab-panels v-model="tab" animated >
        <q-tab-panel name="about">
            <div class="q-pa-auto row">
              Hello World
            </div>
        </q-tab-panel>
        <q-tab-panel name="docs">
            <div class="q-pa-auto row text-left markdown-body">
              <q-card flat>
                <q-card-section class="text-sm">
                 <VueShowdown :markdown="readme" flavor="github"/>
               </q-card-section>
             </q-card>
            </div>
        </q-tab-panel>
      </q-tab-panels>
  </div>

</template>

<script lang='ts'>

import { defineComponent, onMounted , ref } from 'vue';
import { useClientStore, useGlobalVariables } from 'src/stores/dtiplayground';
import "github-markdown-css";

export default defineComponent({
  setup (props, ctx) {
    const $c = useClientStore();
    const $g = useGlobalVariables();
    const readme = ref<string>('');
    const tab = ref<any>('docs');
    async function fetchReadMe() {
      const client = await $c.client;
      const { data } = await client.getReadMe();
      readme.value = data;
    }
    onMounted(async () => {
      await fetchReadMe();
      $g.setApplicationName(null);
    });
    return {
      readme,
      tab
    }
  }
});

</script>