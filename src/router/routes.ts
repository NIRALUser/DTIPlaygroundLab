import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') },
               { path: '/docs', component: () => import('pages/DocsPage.vue')},
               { path: '/dmriatlasbuilder', component: () => import('pages/dmriatlasbuilder/DMRIAtlasBuilder.vue')},
               { path: '/dmriprep', component: () => import('pages/dmriprep/DMRIPrep.vue')},
               { path: '/dmriviewer', component: () => import('pages/dmriviewer/DMRIViewer.vue')},
               { path: '/dmrivolumeselector', component: () => import('pages/dmrivolumeselector/DMRIVolumeSelector.vue')},
               { path: '/dmrifiberprofile', component: () => import('pages/dmrifiberprofile/DMRIFiberProfile.vue')},
               { path: '/moduleeditor', component: () => import('pages/moduleeditor/ModuleEditor.vue')},
    ],
  },
  // {
  //   path: '/dmriatlasbuilder',
  //   name: 'dmriatlasbuilder',
  //   component: () => import('../pages/dmriatlasbuilder/DMRIAtlasBuilder.vue')
  // },
  // {
  //   path: '/dmriprep',
  //   name: 'dmriprep',
  //   component: () => import('../pages/dmriprep/DMRIPrep.vue')
  // },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
