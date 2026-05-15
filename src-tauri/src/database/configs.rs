use crate::models::{default_test_config, TestConfig};
use rusqlite::params;
use rusqlite::Result as SqlResult;

/// 获取所有配置
pub fn list_configs() -> SqlResult<Vec<TestConfig>> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT config_data FROM configs ORDER BY updated_at DESC"
    )?;
    
    let configs = stmt.query_map([], |row| {
        let data: String = row.get(0)?;
        let config: TestConfig = serde_json::from_str(&data).unwrap_or_else(|_| {
            default_test_config()
        });
        Ok(config)
    })?;
    
    configs.collect()
}

/// 根据ID获取配置
pub fn get_config(id: &str) -> SqlResult<Option<TestConfig>> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let mut stmt = conn.prepare("SELECT config_data FROM configs WHERE id = ?")?;
    
    let result = stmt.query_row(params![id], |row| {
        let data: String = row.get(0)?;
        let config: TestConfig = serde_json::from_str(&data)
            .map_err(|_| rusqlite::Error::InvalidQuery)?;
        Ok(config)
    });
    
    match result {
        Ok(config) => Ok(Some(config)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

/// 保存配置
pub fn save_config(config: &TestConfig) -> SqlResult<bool> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let config_data = serde_json::to_string(config)
        .map_err(|_| rusqlite::Error::InvalidQuery)?;
    
    let id = config.id.as_ref().cloned().unwrap_or_else(|| {
        uuid::Uuid::new_v4().to_string()
    });
    
    let now = super::chrono_lite_timestamp();
    
    conn.execute(
        "INSERT OR REPLACE INTO configs (id, name, version, config_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM configs WHERE id = ?), ?), ?)",
        params![id, config.name, config.version, config_data, id, now, now],
    )?;
    
    Ok(true)
}

/// 删除配置
pub fn delete_config(id: &str) -> SqlResult<bool> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let rows = conn.execute("DELETE FROM configs WHERE id = ?", params![id])?;
    Ok(rows > 0)
}
