use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tauri::Manager;
use tokio::sync::Mutex;

/// 数据库管理器
pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub async fn new(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| e.to_string())?;
        
        std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
        
        let db_path = app_dir.join("dock_tester.db");
        tracing::info!("Database path: {:?}", db_path);
        
        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
        
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}

/// 初始化数据库
pub async fn init_database(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let db = Database::new(app_handle).await?;
    let conn = db.conn.lock().await;
    
    // 创建配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS configs (
            id TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            data TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;
    
    // 创建测试结果表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS test_results (
            id TEXT PRIMARY KEY,
            config_id TEXT NOT NULL,
            config_name TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT NOT NULL,
            summary TEXT NOT NULL,
            items TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| e.to_string())?;
    
    // 创建MES日志表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS mes_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT
        )",
        [],
    )
    .map_err(|e| e.to_string())?;
    
    tracing::info!("Database initialized successfully");
    Ok(())
}
