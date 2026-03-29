<!--
  TodoInput - 任务输入框组件 (增强版)
  功能：输入新任务文本、选择截止日期、设定优先级
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useTodos } from '../composables/useTodos';
import type { Priority } from '../types';

const { t } = useI18n();
const { addTodo, isInputVisible } = useTodos();

/** 获取本地区域的当天日期字符串 (YYYY-MM-DD) */
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** 输入状态 */
const newTodoText = ref('');
const dueDate = ref(getTodayStr()); // 默认选中今天
const priority = ref<Priority>('medium');
const isExpanded = ref(false);

/** 引用和高度自适应 */
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

/** 提交新任务 */
function handleSubmit() {
  const text = newTodoText.value.trim();
  if (!text) return;
  
  addTodo(text, dueDate.value || null, priority.value);
  
  // 重置表单
  newTodoText.value = '';
  dueDate.value = getTodayStr();
  priority.value = 'medium';
  isExpanded.value = false;
  isInputVisible.value = false; // 提交后隐藏
  
  // 重置高度
  if (textareaRef.value) {
    textareaRef.value.style.height = '40px';
  }
}

/** 快捷设置优先级 */
function setPriority(p: Priority) {
  priority.value = p;
}

/** 检查输入框焦点以决定展开/收缩 */
function handleFocus() {
  isExpanded.value = true;
}
</script>

<template>
  <transition name="fade">
    <div 
      v-show="isInputVisible"
      class="mb-4 bg-white/5 border border-white/10 rounded-xl p-2 transition-all duration-300"
    >
    <!-- 第一行：输入和按钮 -->
    <div class="flex gap-2 items-start">
      <textarea
        v-model="newTodoText"
        ref="textareaRef"
        :placeholder="t.placeholder"
        @focus="handleFocus"
        @input="adjustHeight"
        @keydown.enter.exact.prevent="handleSubmit"
        class="flex-1 bg-transparent border-none rounded-lg px-2 py-2 text-[0.95em] outline-none transition-all placeholder:text-white/40 resize-none min-h-[40px] max-h-[120px] scrollbar-none"
        rows="1"
      ></textarea>
      <button
        @click="handleSubmit"
        :disabled="!newTodoText.trim()"
        class="w-10 h-10 bg-gradient-to-br from-[#9d4edd] to-[#7b2cbf] text-white border-none rounded-lg text-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-[#7b2cbf]/30 hover:shadow-[#7b2cbf]/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        +
      </button>
    </div>

    <!-- 第二行：日期和优先级 (展开后可见) -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="max-h-0 opacity-0 transform -translate-y-2 overflow-hidden"
      enter-to-class="max-h-[100px] opacity-100 transform translate-y-0 overflow-hidden"
      leave-from-class="max-h-[100px] opacity-100 transform translate-y-0 overflow-hidden"
      leave-to-class="max-h-0 opacity-0 transform -translate-y-2 overflow-hidden"
    >
      <div v-if="isExpanded" class="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
        <!-- 日期选择 -->
        <div class="flex items-center gap-2">
          <span class="text-[0.75rem] text-white/50">📅</span>
          <input
            v-model="dueDate"
            type="date"
            class="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[0.8rem] text-white/80 outline-none focus:border-[#9d4edd] transition-colors"
          />
        </div>

        <!-- 优先级选择 -->
        <div class="flex items-center gap-2">
          <div class="flex gap-1.5 no-drag">
            <button
              v-for="p in (['low', 'medium', 'high'] as Priority[])"
              :key="p"
              type="button"
              @click="setPriority(p)"
              class="w-5 h-5 rounded-full border-2 transition-all"
              :class="{
                'bg-[#8ac926]': p === 'low',
                'bg-[#ffb703]': p === 'medium',
                'bg-[#ff4d6d]': p === 'high',
                'border-white scale-125 shadow-[0_0_8px_white]': priority === p,
                'border-transparent opacity-40 hover:opacity-80': priority !== p
              }"
              :title="p === 'high' ? t.priorityHigh : p === 'medium' ? t.priorityMedium : t.priorityLow"
            ></button>
          </div>
        </div>
      </div>
    </transition>
    </div>
  </transition>
</template>
