/**
 * 全局类型定义
 * 所有模块共享的接口和类型
 */

/** 待办事项优先级 */
export type Priority = 'high' | 'medium' | 'low';

/** 待办事项 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  priority: Priority;
  createdAt: string;
}

/** 应用设置 */
export interface Settings {
  language: string;
  shortcut: string;
  autoStart: boolean;
  bgColor: string;
  opacity: number;
  windowWidth: number;
  windowHeight: number;
  fontSize: number;
}

/** 吸附的边缘方向 */
export type DockEdge = 'top' | 'left' | 'right';

/** 多语言翻译键值 */
export interface Translations {
  title: string;
  placeholder: string;
  settingsTitle: string;
  language: string;
  color: string;
  size: string;
  font: string;
  shortcut: string;
  shortcutHint: string;
  autostart: string;
  save: string;
  pinWindow: string;
  unpinWindow: string;
  // 新增增强功能的翻译
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  filterAll: string;
  filterToday: string;
  filterUpcoming: string;
  filterExpired: string;
  filterCompleted: string;
  noTasks: string;
  dueDateLabel: string;
  overdue: string;
  confirmDelete: string;
  delete: string;
  cancel: string;
}

/** 默认设置 */
export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  shortcut: 'Alt+T',
  autoStart: false,
  bgColor: '#191923',
  opacity: 65,
  windowWidth: 400,
  windowHeight: 500,
  fontSize: 15,
};
