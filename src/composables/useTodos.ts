/**
 * useTodos - 待办事项管理
 *
 * 功能：
 * - 增删改查待办事项
 * - 通过 tauri-plugin-store 持久化存储
 * - 对外暴露响应式 todos 列表
 */
import { ref } from 'vue';
import { Store } from '@tauri-apps/plugin-store';
import type { Todo } from '../types';

const todos = ref<Todo[]>([]);
let store: Store | null = null;

/**
 * 初始化存储并加载已保存的待办事项
 * @param storeInstance - 共享的 Store 实例
 */
async function initTodos(storeInstance: Store) {
  store = storeInstance;
  const saved = await store.get<Todo[]>('todos');
  if (saved) {
    todos.value = saved;
  }
}

/** 持久化保存到磁盘 */
async function persist() {
  if (store) {
    await store.set('todos', todos.value);
    await store.save();
  }
}

/** 添加新的待办事项 */
function addTodo(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.value.push({ text: trimmed, completed: false });
  persist();
}

/** 删除指定索引的待办事项 */
function deleteTodo(index: number) {
  todos.value.splice(index, 1);
  persist();
}

/** 切换指定索引的完成状态 */
function toggleTodo(index: number) {
  todos.value[index].completed = !todos.value[index].completed;
  persist();
}

/**
 * 待办事项 composable
 */
export function useTodos() {
  return {
    todos,
    initTodos,
    addTodo,
    deleteTodo,
    toggleTodo,
    saveTodos: persist,
  };
}
