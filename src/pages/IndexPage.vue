<template>
  <q-page>
    <div class="row">
      <div class="col-12 text-center noselect">
        <q-item v-for="(link, idx) in linksList" class="q-pa-none" clickable @click="pushTo(link.link)">
          <q-item-section class="text-primary text-uppercase">
            <q-btn flat>{{ link.title}} </q-btn>
          </q-item-section>
          <q-separator/>
        </q-item>
      </div>
    </div>
  </q-page>>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalVariables } from 'src/stores/dtiplayground';

const linksList = [
  {
    title: 'DMRI Prep ',
    caption: 'Pipelined QC processor',
    icon: 'visibility',
    link: '/dmriprep'
  },
  {
    title: 'DMRI Atlas Builder',
    caption: 'Register and average diffusion tensor images',
    icon: 'build',
    link: '/dmriatlasbuilder'
  },
  {
    title: 'DMRI Viewer',
    caption: 'DMRI Image viewer',
    icon: 'image',
    link: '/dmriviewer'
  },
  {
    title: 'DMRI Volume Selector',
    caption: 'DMRI Volume Selector',
    icon: 'image',
    link: '/dmrivolumeselectorr'
  },
  {
    title: 'DMRI Fiber Profile',
    caption: 'DMRI Fiber Profile',
    icon: 'image',
    link: '/dmrifiberprofile'
  },
  {
    title: 'Module Editor',
    caption: 'Edit custom modules and test',
    icon: 'code',
    link: '/moduleeditor'
  },
  {
    title: 'Documentations',
    caption: 'DTI Playground Documentations',
    icon: 'info_outline',
    link: '/docs'
  },
];

export default defineComponent({
  props: [],
  components: { },
  setup (props, ctx) {
    const $g = useGlobalVariables();
    const router = useRouter();
    function pushTo(href) {
      console.log(href);
      router.push(href);
    }
    onMounted(() => {
      $g.setApplicationName(null);
    });
    return {
      linksList,
      pushTo,
    };
  }
});

</script>
