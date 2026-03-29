// Tauri 后端入口
// 提供窗口管理、插件初始化和自定义命令

use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

/// 光标坐标结构体，序列化后传递给前端
#[derive(Serialize)]
struct CursorPosition {
    x: i32,
    y: i32,
}

/// 获取当前鼠标光标的屏幕坐标（物理像素）
/// 通过 Windows API `GetCursorPos` 实现，无需依赖 WebView 事件
#[tauri::command]
fn get_cursor_position() -> CursorPosition {
    #[cfg(target_os = "windows")]
    {
        use std::mem::MaybeUninit;

        #[repr(C)]
        struct POINT {
            x: i32,
            y: i32,
        }

        extern "system" {
            fn GetCursorPos(lp_point: *mut POINT) -> i32;
        }

        let mut point = MaybeUninit::<POINT>::uninit();
        unsafe {
            GetCursorPos(point.as_mut_ptr());
            let point = point.assume_init();
            CursorPosition {
                x: point.x,
                y: point.y,
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 非 Windows 平台暂时返回 (0, 0)
        CursorPosition { x: 0, y: 0 }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 1. 创建托盘菜单
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "显示主界面", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // 2. 创建系统托盘
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        // 寻找主窗口，如果存在则显示并聚焦
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    // 监听托盘图标左键点击
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            // 拦截关闭按钮事件，将其变为隐藏
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![get_cursor_position])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}
