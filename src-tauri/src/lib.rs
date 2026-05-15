mod commands;
pub mod database;
pub mod models;

use commands::*;
use commands::test_commands::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .setup(|app| {
            // 初始化数据库
            let app_handle = app.handle().clone();
            let app_data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            
            // 同步初始化数据库
            if let Err(e) = database::init_database(app_data_dir) {
                tracing::error!("Failed to initialize database: {:?}", e);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 测试命令
            test_start,
            test_stop,
            test_get_status,
            test_get_result,
            // 配置命令
            config_get,
            config_save,
            config_list,
            config_delete,
            config_import,
            config_export,
            // MES命令
            mes_connect,
            mes_disconnect,
            mes_get_status,
            mes_get_orders,
            mes_upload_result,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
