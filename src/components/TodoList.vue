<!--
  TodoList - 任务列表组件
  功能：展示待办事项，支持勾选完成和删除
-->
<script setup lang="ts">
import { useTodos } from '../composables/useTodos';

const { todos, deleteTodo, saveTodos } = useTodos();
</script>

<template>
  <ul class="flex-1 overflow-y-auto pr-2 list-none space-y-2">
    <li
      v-for="(todo, index) in todos"
      :key="index"
      class="flex items-center p-2.5 bg-white/5 border border-white/10 rounded-lg shadow-sm hover:translate-y-[-2px] hover:bg-white/10 hover:border-white/25 transition-all group"
      :class="{ 'opacity-70': todo.completed }"
    >
      <!-- 勾选框 -->
      <input
        type="checkbox"
        v-model="todo.completed"
        @change="saveTodos"
        class="mr-2 w-5 h-5 accent-[#9d4edd] cursor-pointer hover:scale-110 transition-transform"
      />

      <!-- 任务文本 -->
      <span
        class="flex-1 text-[0.95em] leading-relaxed break-words transition-all"
        :class="{ 'line-through text-white/50': todo.completed }"
      >
        {{ todo.text }}
      </span>

      <!-- 删除按钮 -->
      <button
        @click="deleteTodo(index)"
        class="text-white/50 text-xl leading-none opacity-50 group-hover:opacity-100 hover:text-[#ff4d6d] hover:scale-125 hover:rotate-90 transition-all cursor-pointer"
      >
        ×
      </button>
    </li>
  </ul>
</template>
