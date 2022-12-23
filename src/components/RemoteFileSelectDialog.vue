<template>
  <div>
    <q-dialog v-model="isOpen">
      <div class="file-dialog bg-white">
              <div class="dialog-body">
                <div class="row">
                  <div class="col">
                      <div class="q-pa-xs text-h6 bg-primary text-white row">
                        <div class="q-pa-xs text-h5 col-sm-8 col-xs-2" align="left">
  <!--                           <q-icon name="folder" color="white"/> -->
                          <q-btn icon="turn_left" flat @click="goUpperDir(root)"/>
                        </div>
                        <div align="right" class="q-pa-xs text-white col-sm-4 col-xs-10">
                            <q-btn flat dense label="Cancel" class="text-white" v-close-popup />
                            <q-btn flat dense label="Select" class="text-white" @click="closeModal(true)" />
                        </div>
                      </div>
                  </div>
                </div>
                <div class="row scrollable">
                  
                    <div class="row">
                          <div class="q-pt-none leftpanel col-4 gt-xs">
                              <draggable
                                :list="favorites.val"
                                :group="{ name: 'files', put:true}"
                                itemKey="path"
                              >
                                <template #item="{element:file, index}">
                                  <div class="favorite row">
                                    <div class="col-12">
                                          <q-item dense clickable>
                                            <q-item-section>
                                               <template v-if="file.is_dir">
                                                   <div @click.left.exact = "onSelectFavorite(file)"                                              
                                                        :class =" { 'truncate hover' : true}">
                                                       <q-icon name="folder" color="orange"/>
                                                       <a class='overflow-hidden'>{{ file.name }}</a>
                                                   </div>
                                               </template>
                                               <template v-else>
                                                  <div @click.left.exact = "onSelectFavorite(file)"
                                                       :class =" { 'truncate hover' : true }">
                                                    <q-icon name="description" color="green"/>
                                                    <a >{{ file.name }}</a>
                                                  </div>
                                               </template>
                                               <q-tooltip>
                                                  {{file.path}}
                                               </q-tooltip>
                                            </q-item-section>
                                            <q-item-section side>
                                              <q-btn class="tools" flat icon="highlight_off" size="xs" color="negative" @click="removeFavorite(file)"/>
                                            </q-item-section>
                                          </q-item>
                                    </div>
                                  </div>
                                </template>

                              </draggable>
                          </div>
                          <div class="q-pt-none navigator-scroll col-sm-8 col-xs-12">
                            <q-scroll-area class="scrollarea">
                               <RemoteFileNavigator ref="fileNavigator" :root="root" :directory="directory" :multiple="multiple" v-model="selectedFiles" v-on:changed-dir="onChangedDir" :extensions="extensions"/>
                            </q-scroll-area>
                          </div>
                    </div>
                </div>
              </div>
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref, computed, watch, reactive } from 'vue';
import RemoteFileNavigator from 'src/components/RemoteFileNavigator.vue';
import { ParentNameFromPath } from 'src/utils';
import draggable from 'vuedraggable';

export default defineComponent({
  props: { 
    modelValue: {
      type: Array,
      required: false,
      default: []
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    directory: {
      type: Boolean,
      required: false,
      default: false,      
    },
    root: {
      type: String,
      required: false,
      default: '/'
    },
    extensions: {
      type: Array,
      default: null
    }
  },
  components: { RemoteFileNavigator, 
                draggable },
  setup (props, ctx) {
    const isOpen = ref(false);
    const selectedFiles = ref<any[]>([]);
    const fileNavigator =ref(null);
    const favorites = reactive<any>({val: []});
    

    function onChangedDir(ev) {
      ctx.emit('changed-dir', ev);
    }
    
    function goUpperDir(ev) {
      const [ newdir, name ] = ParentNameFromPath(props.root);
      fileNavigator.value.changeRoot(newdir);
      onChangedDir(newdir);
    }
    function onSelectFavorite(file) {
      if (file.is_dir) {
        onChangedDir(file.path);
      } else {

      }
    }
    function removeFavorite(file) {
      const idx = favorites.val.indexOf(file);
      favorites.val.splice(idx,1);
      localStorage.setItem('favoriteFiles', JSON.stringify(favorites.val));
    }
    watch(favorites,(nv,ov) => {
      console.log(nv);
      localStorage.setItem('favoriteFiles', JSON.stringify(favorites.val));
    });
    function closeModal(save) {
      if (save) {
        ctx.emit('update:modelValue', selectedFiles.value);
      }
      isOpen.value = false
    }
    function openModal() {
      isOpen.value = true
      selectedFiles.value = []
    }
    onMounted(() => {
      if (localStorage.getItem('favoriteFiles')) {
        favorites.val = JSON.parse(localStorage.getItem('favoriteFiles'));
      }
    });
    return {
      isOpen,
      closeModal,
      openModal,
      selectedFiles,
      goUpperDir,
      onChangedDir,
      onSelectFavorite,
      fileNavigator,
      favorites,
      removeFavorite,
    };
  }
});
</script>
<style scoped>
.leftpanel {
  position: relative;
  min-height:10vh;
  max-width: 300px;
  min-width: 20vh;
/*  border: 1px solid;*/
}
.navigator-scroll {
  height: 80vh;
  border-left: 1px solid lightgray;
}
.scrollarea {
  width: 83vh;
  height:80vh;
}
.file-dialog {
  min-width: max(350px,100%);
/*  max-width: 80%;*/
/*  max-height: 80%;
  min-height: 80%;*/
}
.favorite .tools {
  display: none;
}
.favorite:hover .tools{
  display: block;
}
</style>
