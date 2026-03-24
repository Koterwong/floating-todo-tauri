<!--
  TodoInput - 任务输入框组件
  功能：输入新任务文本并提交
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useTodos } from '../composables/useTodos';

const { t } = useI18n();
const { addTodo } = useTodos();

/** 输入框文本 */
const newTodoText = ref('');

/** 提交新任务 */
function handleSubmit() {
  addTodo(newTodoText.value);
  newTodoText.value = '';
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex gap-2 mb-2">
    <input
      v-model="newTodoText"
      type="text"
      :placeholder="t.placeholder"
      class="flex-1 bg-white/10 border border-white/15 rounded-lg px-4 py-2 text-[0.95em] outline-none focus:border-[#9d4edd] focus:bg-white/10 focus:ring-2 ring-[#9d4edd]/30 transition-all shadow-inner placeholder:text-white/50"
    />
    <button
      type="submit"
      class="w-10 bg-gradient-to-br from-[#9d4edd] to-[#7b2cbf] text-white border-none rounded-lg text-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-[#7b2cbf]/40 hover:from-[#c77dff] hover:to-[#9d4edd] hover:-translate-y-0.5 transition-all"
    >
      +
    </button>
  </form>
</template>
