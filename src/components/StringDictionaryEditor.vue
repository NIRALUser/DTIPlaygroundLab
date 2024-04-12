<template>
  <div>
    <q-table :rows="dict.rows" :title="title" row-key="key" row-class="row" :editable="true" @row-save="saveRow"
      :columns="columns" :pagination="initialPagination" :hide-bottom="true">
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <!-- if the column is the key column, don't make it editable -->
          <div v-if="props.col.name === 'key'">
            {{ props.row[props.col.name] }}
          </div>
          <q-input v-else v-model="props.row[props.col.name]" @input="val => updateRow(props, val)"
            input-class="text-right" type="text" dense borderless />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    title: {
      type: String,
      default: 'Dictionary',
    },
  },
  setup(props, { emit }) {
    const columns = [
      {
        name: 'key',
        label: 'Key',
        field: 'key',
      },
      {
        name: 'value',
        label: 'Column Header',
        field: 'value',
      }
    ];

    const initialPagination = {
      rowsPerPage: 0
    }
    const dict = reactive<any>({ rows: [] });

    // Initialize rows with the modelValue provided as props
    if (props.modelValue) {
      console.log('modelValue', Object.entries(props.modelValue));
      for (const [key, value] of Object.entries(props.modelValue)) {
        dict.rows.push({ key: key, value: value });
      }
    }

    function addRow() {
      dict.rows.value.push({ key: '', value: '' });
      console.log(dict.rows.value)
    }

    watch(dict, (nv, ov) => {
      saveRow(nv);
      console.log('rows', nv);
    });


    function saveRow(row) {
      // Handle saving edited row
      // You may emit an event here to update the modelValue prop
      emit('update:modelValue', dict.rows.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {}));
    }
    function updateRow(props, val) {
      console.log("UPDATE!!")
      // Find the index of the row in the rows array
      const index = rows.value.findIndex(row => row.key === props.row.key);
      if (index !== -1) {
        // Update the value of the row at the found index
        dict.rows.value[index].value = val;
      }
      // Manually trigger the update method on the row
      saveRow(props.row);
    }


    return {
      dict,
      columns,
      initialPagination,
      addRow,
      saveRow,
      updateRow,
    };
  },
});
</script>

<style scoped>
.row {}
</style>
