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
          <q-item dense 
                  class="q-pa-sm" 
                  tag="a" 
                  target="_blank" 
                  href="https://github.com/niraluser/dtiplayground">
                {{ APP_TITLE }} <div class="q-pa-auto text-caption" >{{ currentApplication }} </div>

          </q-item>
        </q-toolbar-title>

        <div> <q-item dense class="q-pa-sm" tag="a" target="_blank" href="https://www.med.unc.edu/psych/research/niral/"><q-item-section side class="text-white text-caption">{{applicationInfo.hostname }} v{{ applicationInfo.version }} </q-item-section><q-item-section>NIRAL</q-item-section></q-item> </div>
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
          <q-btn flat color="primary" @click="toggleLeftDrawer">Close Menu</q-btn>
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
      <GlobalNotification />
    </q-page-container>
  </q-layout>
</template>
<script lang="ts">

import { defineComponent, onMounted, watchEffect, ref } from 'vue';
import store from '../stores';
import { storeToRefs } from 'pinia';
import Router from '../router';
import { useQuasar } from 'quasar';
import BaseMenu from 'components/BaseMenu.vue';
import GlobalNotification from 'components/GlobalNotification.vue';
import { APP_TITLE } from 'src/environments.ts';
import { useGlobalNotification, useGlobalVariables } from 'src/stores/dtiplayground';

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
    title: 'DMRI Viewer',
    caption: 'DMRI Image viewer',
    icon: 'image',
    link: '#/dmriviewer'
  },
  {
    title: 'Module Editor',
    caption: 'Edit custom modules and test',
    icon: 'code',
    link: '#/moduleeditor'
  },
  {
    title: 'Documentations',
    caption: 'DTI Playground Documentations',
    icon: 'info_outline',
    link: '#/docs'
  },
];

export default defineComponent({
  props: [],
  components: { BaseMenu, GlobalNotification },
  setup (props, ctx) {
    const leftDrawerOpen = ref(false);
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { currentApplication, applicationInfo } = storeToRefs($g);
    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }
    onMounted(async () => {
      $n.notify({ message : "Welcome to DTI Playground", color: "green", timeout: 1000});
      $g.getApplicationInfo();
    });
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer,
      Router,
      APP_TITLE,
      currentApplication,
      applicationInfo,
    };
  }
});

</script>