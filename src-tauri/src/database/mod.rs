//! 数据库模块
//! 负责SQLite数据库的初始化和连接管理

pub mod configs;

use rusqlite::{Connection, Result as SqlResult};
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

/// 全局数据库连接
pub static DB: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

/// 初始化数据库
pub fn init_database(app_data_dir: PathBuf) -> SqlResult<()> {
    // 确保目录存在
    std::fs::create_dir_all(&app_data_dir).ok();
    
    // 构建数据库路径
    let db_path = app_data_dir.join("dock_tester.db");
    tracing::info!("Initializing database at: {:?}", db_path);
    
    // 创建连接
    let conn = Connection::open(&db_path)?;
    
    // 创建表
    create_tables(&conn)?;
    
    // 存储连接
    let mut db = DB.lock().unwrap();
    *db = Some(conn);
    
    tracing::info!("Database initialized successfully");
    Ok(())
}

/// 获取数据库连接
pub fn get_connection() -> SqlResult<std::sync::MutexGuard<'static, Option<Connection>>> {
    let guard = DB.lock().unwrap();
    if guard.is_none() {
        return Err(rusqlite::Error::InvalidQuery);
    }
    Ok(guard)
}

/// 创建数据库表
fn create_tables(conn: &Connection) -> SqlResult<()> {
    // 配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS configs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            config_data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;
    
    // 测试历史表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS test_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_id TEXT,
            serial_number TEXT,
            result TEXT NOT NULL,
            test_data TEXT,
            test_time TEXT NOT NULL,
            operator_id TEXT,
            FOREIGN KEY (config_id) REFERENCES configs(id)
        )",
        [],
    )?;
    
    // 系统设置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;
    
    // MES配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS mes_config (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            server_url TEXT NOT NULL,
            api_key TEXT NOT NULL,
            factory_code TEXT NOT NULL,
            line_code TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;
    
    tracing::info!("Database tables created successfully");
    Ok(())
}

/// 获取当前时间戳（简化实现）
pub fn chrono_lite_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();
    format!("{}", secs)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_timestamp() {
        let ts = chrono_lite_timestamp();
        assert!(!ts.is_empty());
    }
}
