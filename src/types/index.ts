/**
 * 全局类型定义
 * 所有模块共享的接口和类型
 */

/** 待办事项 */
export interface Todo {
  text: string;
  completed: boolean;
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
}

/** 默认设置 */
export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  shortcut: 'Alt+T',
  autoStart: false,
  bgColor: '#191923',
  opacity: 65,
  windowWidth: 350,
  windowHeight: 500,
  fontSize: 15,
};
