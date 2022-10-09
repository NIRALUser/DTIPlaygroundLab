<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-item dense class="q-pa-sm" tag="a" target="_blank" href="https://github.com/niraluser/dtiplayground">DTI Playground</q-item>
        </q-toolbar-title>

        <div> <q-item dense class="q-pa-sm" tag="a" target="_blank" href="https://www.med.unc.edu/psych/research/niral/">NIRAL</q-item> </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Menu
        </q-item-label>

        <BaseMenu
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect, computed } from 'vue';
import { ref } from 'vue';
import store from '../stores';
import Router from '../router';
import BaseMenu from 'components/BaseMenu.vue';

const linksList = [
  {
    title: 'Home',
    caption: 'DTI Playground Home',
    icon: 'home',
    link: '#/'
  },
  {
    title: 'DMRI Prep ',
    caption: 'Pipelined QC processor',
    icon: 'visibility',
    link: '#/dmriprep'
  },
  {
    title: 'DMRI Atlas Builder',
    caption: 'Register and average diffusion tensor images',
    icon: 'build',
    link: '#/dmriatlasbuilder'
  },
  {
    title: 'About',
    caption: 'About DTI Playground',
    icon: 'question_mark',
    link: '#/about'
  },
];

export default defineComponent({
  props: [],
  components: { BaseMenu },
  setup (props, ctx) {
    const leftDrawerOpen = ref(false);
    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }
    onMounted(async () => {
    });
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer,
      Router,
    };
  }
});

</script>