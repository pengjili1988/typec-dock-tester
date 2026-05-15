// 共享数据模型
// 独立模块，避免 commands 和 database 之间的循环依赖

use serde::{Deserialize, Serialize};

/// 配置数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestConfig {
    pub id: Option<String>,
    pub version: String,
    pub name: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
    pub product: ProductConfig,
    #[serde(rename = "testItems")]
    pub test_items: TestItemsConfig,
    pub usb: UsbConfig,
    pub video: VideoConfig,
    pub audio: AudioConfig,
    pub network: NetworkConfig,
    pub pd: PdConfig,
    pub sd: SdConfig,
    pub firmware: FirmwareConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductConfig {
    pub model: String,
    pub vid: String,
    pub pid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestItemsConfig {
    pub usb: bool,
    pub video: bool,
    pub audio: bool,
    pub network: bool,
    pub pd: bool,
    pub sd: bool,
    pub firmware: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsbConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: SpeedThresholds,
    #[serde(rename = "voltageRange")]
    pub voltage_range: VoltageRange,
    #[serde(rename = "ovpThreshold")]
    pub ovp_threshold: f64,
    #[serde(rename = "vidPidCheck")]
    pub vid_pid_check: VidPidCheck,
    pub timeout: u32,
    pub retries: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeedThresholds {
    #[serde(rename = "readMin")]
    pub read_min: f64,
    #[serde(rename = "writeMin")]
    pub write_min: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoltageRange {
    pub min: f64,
    pub max: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VidPidCheck {
    #[serde(rename = "expectedVid")]
    pub expected_vid: String,
    #[serde(rename = "expectedPid")]
    pub expected_pid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoConfig {
    pub enabled: bool,
    pub ports: Vec<VideoPort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoPort {
    #[serde(rename = "portType")]
    pub port_type: String,
    pub protocol: String,
    pub resolutions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub enabled: bool,
    pub ports: Vec<AudioPort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioPort {
    #[serde(rename = "portType")]
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub enabled: bool,
    #[serde(rename = "supportedSpeeds")]
    pub supported_speeds: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: std::collections::HashMap<String, f64>,
    #[serde(rename = "macValidation")]
    pub mac_validation: MacValidation,
    #[serde(rename = "macBurnEnabled")]
    pub mac_burn_enabled: bool,
    #[serde(rename = "macSource")]
    pub mac_source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacValidation {
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    pub voltages: Vec<f64>,
    pub currents: Vec<f64>,
    #[serde(rename = "maxPower")]
    pub max_power: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SdConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: SpeedThresholds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirmwareConfig {
    pub enabled: bool,
    #[serde(rename = "firmwareTypes")]
    pub firmware_types: Vec<String>,
}

/// 构建默认 TestConfig（用于数据库读取失败时的 fallback）
pub fn default_test_config() -> TestConfig {
    TestConfig {
        id: None,
        version: "1.0.0".to_string(),
        name: "Unknown".to_string(),
        created_at: None,
        updated_at: None,
        product: ProductConfig {
            model: "Unknown".to_string(),
            vid: "0x0000".to_string(),
            pid: "0x0000".to_string(),
        },
        test_items: TestItemsConfig {
            usb: true,
            video: true,
            audio: true,
            network: true,
            pd: true,
            sd: true,
            firmware: true,
        },
        usb: UsbConfig {
            enabled: true,
            protocols: vec!["USB3.0".to_string()],
            speed_thresholds: SpeedThresholds {
                read_min: 100.0,
                write_min: 50.0,
            },
            voltage_range: VoltageRange {
                min: 4.75,
                max: 5.25,
            },
            ovp_threshold: 5.8,
            vid_pid_check: VidPidCheck {
                expected_vid: "0x1234".to_string(),
                expected_pid: "0x5678".to_string(),
            },
            timeout: 30000,
            retries: 3,
        },
        video: VideoConfig {
            enabled: true,
            ports: vec![],
        },
        audio: AudioConfig {
            enabled: true,
            ports: vec![],
        },
        network: NetworkConfig {
            enabled: true,
            supported_speeds: vec!["1G".to_string()],
            speed_thresholds: std::collections::HashMap::new(),
            mac_validation: MacValidation {
                format: "XX:XX:XX:XX:XX:XX".to_string(),
            },
            mac_burn_enabled: false,
            mac_source: "config".to_string(),
        },
        pd: PdConfig {
            enabled: true,
            protocols: vec!["PD3.0".to_string()],
            voltages: vec![5.0, 9.0, 12.0],
            currents: vec![1.5, 3.0],
            max_power: 65.0,
        },
        sd: SdConfig {
            enabled: true,
            protocols: vec!["SD".to_string()],
            speed_thresholds: SpeedThresholds {
                read_min: 20.0,
                write_min: 10.0,
            },
        },
        firmware: FirmwareConfig {
            enabled: true,
            firmware_types: vec!["USB".to_string()],
        },
    }
}
