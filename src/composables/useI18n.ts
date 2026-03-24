/**
 * useI18n - 多语言管理
 *
 * 功能：
 * - 加载 locales 目录下的翻译 JSON
 * - 提供响应式翻译对象 `t`
 * - 支持运行时切换语言
 */
import { ref, type Ref } from 'vue';
import type { Translations } from '../types';

// 静态导入翻译文件（Vite 会在编译时处理 JSON 导入）
import en from '../locales/en.json';
import zh from '../locales/zh.json';

/** 所有语言包映射 */
const locales: Record<string, Translations> = { en, zh };

/** 当前翻译对象（响应式） */
const t: Ref<Translations> = ref({ ...en });

/** 当前语言代码 */
const currentLang = ref('en');

/**
 * 切换语言
 * @param lang - 语言代码，如 'en' 或 'zh'
 */
function switchLanguage(lang: string) {
  const translations = locales[lang];
  if (translations) {
    t.value = { ...translations };
    currentLang.value = lang;
  } else {
    console.warn(`[i18n] 未找到语言包: ${lang}，回退到英文`);
    t.value = { ...en };
    currentLang.value = 'en';
  }
}

/**
 * 多语言 composable
 */
export function useI18n() {
  return {
    t,
    currentLang,
    switchLanguage,
  };
}
