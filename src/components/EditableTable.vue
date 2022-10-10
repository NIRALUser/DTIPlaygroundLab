<template>
  <div class="q-pa-md" v-if="table.val">
    <q-table
      :dense="$q.screen.lt.md"
      :title="table.val.title"
      :rows="table.val.rows"
      :columns="table.val.columns"
      row-key="name"
      binary-state-sort
      v-model:selected="selected.val"
      :pagination="null"
      flat
      :disable="disable"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :disable="disable" :key="col.name" v-for= "col in table.val.columns" :props="props">
            {{ props.row[col.name] }}
            <q-popup-edit :disable="disable" v-model="props.row[col.name]" v-slot="scope" buttons>
              <q-input :disable="disable" v-model="scope.value" type="number" dense autofocus />
            </q-popup-edit>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, reactive} from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: {}
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  components: { 
  },
  setup (props, ctx) {
    const table = reactive<any>({val: null});
    const selected = reactive<any>({val: []});
    watch(table, (nv, ov) => {
      console.log('Table changed');
      ctx.emit('update:modelValue', table.val);
      ctx.emit('changedParam', table.val);
    });
    onMounted(async () => {  
      table.val = props.modelValue;
    });
    return {
      table,
      selected,
    };
  }
});

</script>