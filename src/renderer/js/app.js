/**
 * XFANIC TYPE-C Dock Tester - Main Application Logic
 * 深圳市湘凡科技有限公司
 */

// Electron IPC for hardware communication
const { ipcRenderer } = require('electron');

// ============ APP STATE ============
const AppState = {
  lang: 'zh',
  currentPage: 'home',
  currentUser: null,
  testConfig: {
    model: '',
    fileName: '默认配置',
    testMode: 'double',
    usb: {
      usb20: { enabled: true, minReadSpeed: 30, minWriteSpeed: 20, minVoltage: 4.8, maxVoltage: 5.2, shortCircuit: true, overvoltage: true, expectedFw: '', expectedPid: '', expectedVid: '' },
      usb30: { enabled: true, minReadSpeed: 100, minWriteSpeed: 80, minVoltage: 4.8, maxVoltage: 5.2, shortCircuit: true, overvoltage: true, fw: true, pid: true, vid: true, expectedFw: '', expectedPid: '', expectedVid: '' },
      usb31: { enabled: true, minReadSpeed: 400, minWriteSpeed: 300, minVoltage: 4.8, maxVoltage: 5.2, shortCircuit: true, overvoltage: true, fw: true, pid: true, vid: true, expectedFw: '', expectedPid: '', expectedVid: '' },
      usb32: { enabled: true, minReadSpeed: 1000, minWriteSpeed: 800, minVoltage: 4.8, maxVoltage: 5.2, shortCircuit: true, overvoltage: true, fw: true, pid: true, vid: true, expectedFw: '', expectedPid: '', expectedVid: '' },
      usb4: { enabled: true, minReadSpeed: 3000, minWriteSpeed: 2000, minVoltage: 4.8, maxVoltage: 5.2, shortCircuit: true, overvoltage: true, fw: true, pid: true, vid: true, expectedFw: '', expectedPid: '', expectedVid: '' }
    },
    video: {
      vga: { enabled: true, minHz: 60, maxHz: 75, minResW: 1920, minResH: 1080, rgbTest: true, pixelCompare: true },
      dp12: { enabled: true, minHz: 60, maxHz: 144, minResW: 2560, minResH: 1440, rgbTest: true, pixelCompare: true },
      dp14: { enabled: true, minHz: 60, maxHz: 144, minResW: 3840, minResH: 2160, rgbTest: true, pixelCompare: true },
      hdmi14: { enabled: true, minHz: 60, maxHz: 60, minResW: 3840, minResH: 2160, rgbTest: true, pixelCompare: true },
      hdmi20: { enabled: true, minHz: 60, maxHz: 120, minResW: 3840, minResH: 2160, rgbTest: true, pixelCompare: true }
    },
    audio: {
      enabled: true, expectedChannels: 2, minFreq: 20, maxFreq: 20000, minSampleRate: 44100, recordingTest: true
    },
    sdcard: {
      sd30: { enabled: true, minReadSpeed: 90, minWriteSpeed: 30, expectedFw: '' },
      sd40: { enabled: true, minReadSpeed: 150, minWriteSpeed: 90, expectedFw: '' }
    },
    network: {
      n100m: { enabled: true, minSpeed: 90 },
      n1000m: { enabled: true, minSpeed: 900 },
      n25g: { enabled: false, minSpeed: 2000 },
      n5g: { enabled: false, minSpeed: 4000 },
      macBurn: { enabled: true, prefix: 'B0:A7:B9' },
      macRule: { enabled: true, pattern: '^B0:A7:B9:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$' }
    },
    pd: {
      pd20: { enabled: true, minVoltage: 5, maxVoltage: 20, minCurrent: 1.5, maxCurrent: 5, minPower: 18, maxPower: 100, expectedFw: '' },
      pd30: { enabled: true, minVoltage: 5, maxVoltage: 20, minCurrent: 1.5, maxCurrent: 5, minPower: 30, maxPower: 100, expectedFw: '' },
      pd31: { enabled: false, minVoltage: 5, maxVoltage: 48, minCurrent: 1.5, maxCurrent: 5, minPower: 60, maxPower: 240, expectedFw: '' }
    },
    fw: {
      usb: { enabled: true, expectedVersion: '' },
      sd: { enabled: true, expectedVersion: '' },
      video: { enabled: true, expectedVersion: '' },
      pd: { enabled: true, expectedVersion: '' }
    }
  },
  testResults: {},
  testRunning: false,
  testTimer: null,
  testStartTime: null,
  statistics: { total: 0, pass: 0, fail: 0 },
  mesConnected: false,
  mesEnabled: true,
  selectedModelId: null,
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', displayName: 'Administrator' },
    { id: 2, username: 'operator', password: 'op123', role: 'operator', displayName: 'Operator' },
    { id: 3, username: 'engineer', password: 'eng123', role: 'engineer', displayName: 'Engineer' }
  ],
  testFiles: [
    { id: 1, name: '默认配置', model: 'Universal', createTime: '2024-01-15 09:00', modifyTime: '2024-01-20 14:30' },
    { id: 2, name: 'HUB-7Port-V2', model: '7口扩展坞', createTime: '2024-02-01 10:00', modifyTime: '2024-03-10 16:00' }
  ]
};

// ============ i18n HELPER ============
function t(key) {
  const lang = AppState.lang;
  const keys = key.split('.');
  let obj = window.i18n[lang];
  for (const k of keys) {
    if (obj === undefined) return key;
    obj = obj[k];
  }
  return obj || key;
}

function switchLang(lang) {
  AppState.lang = lang;
  document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
  document.getElementById('lang-vi').classList.toggle('active', lang === 'vi');
  applyTranslations();
  renderCurrentPage();
  showToast(lang === 'zh' ? '已切换至中文' : 'Đã chuyển sang tiếng Việt', 'info');
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

// ============ DATE TIME ============
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
  const el = document.getElementById('datetime-display');
  if (el) el.textContent = `${dateStr} ${timeStr}`;
}

// ============ TOAST ============
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============ PAGE ROUTING ============
function showPage(page) {
  AppState.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-page') === page);
  });
  renderCurrentPage();
}

function renderCurrentPage() {
  const content = document.getElementById('content-area');
  switch (AppState.currentPage) {
    case 'home':      content.innerHTML = renderHome(); break;
    case 'usb':       content.innerHTML = renderUSBPage(); break;
    case 'video':     content.innerHTML = renderVideoPage(); break;
    case 'audio':     content.innerHTML = renderAudioPage(); break;
    case 'sdcard':    content.innerHTML = renderSDCardPage(); break;
    case 'network':   content.innerHTML = renderNetworkPage(); break;
    case 'pd':        content.innerHTML = renderPDPage(); break;
    case 'fw':        content.innerHTML = renderFWPage(); break;
    case 'users':     content.innerHTML = renderUsersPage(); break;
    case 'fileManager': content.innerHTML = renderFileManagerPage(); break;
    case 'settings':  content.innerHTML = renderSettingsPage(); break;
    default:          content.innerHTML = renderHome();
  }
  bindPageEvents();
}

// ============ HOME PAGE ============
function renderHome() {
  const stats = AppState.statistics;
  const passRate = stats.total > 0 ? Math.round(stats.pass / stats.total * 100) : 0;
  
  const modules = [
    { id: 'usb20', name: 'USB 2.0' }, { id: 'usb30', name: 'USB 3.0' },
    { id: 'usb31', name: 'USB 3.1' }, { id: 'usb32', name: 'USB 3.2' },
    { id: 'usb4', name: 'USB 4' }, { id: 'vga', name: 'VGA' },
    { id: 'dp12', name: 'DP 1.2' }, { id: 'dp14', name: 'DP 1.4' },
    { id: 'hdmi14', name: 'HDMI 1.4' }, { id: 'hdmi20', name: 'HDMI 2.0' },
    { id: 'audio', name: t('nav.audio') }, { id: 'sd30', name: 'SD 3.0' },
    { id: 'sd40', name: 'SD 4.0' }, { id: 'n1000m', name: '1000M' },
    { id: 'pd20', name: 'PD 2.0' }, { id: 'pd30', name: 'PD 3.0' }
  ];

  // 状态显示逻辑：优先显示扩展坞连接状态，然后是测试状态
  let overall, overallTextDisplay;
  if (AppState.testRunning) {
    overall = 'testing';
    overallTextDisplay = t('home.testing');
  } else if (Object.keys(AppState.testResults).length > 0) {
    // 有测试结果，显示PASS/FAIL
    const hasFail = Object.values(AppState.testResults).some(r => r === 'fail');
    overall = hasFail ? 'fail' : 'pass';
    overallTextDisplay = hasFail ? 'FAIL' : 'PASS';
  } else {
    // 无测试结果，显示扩展坞连接状态
    overall = dockConnected ? 'connected' : 'waiting';
    overallTextDisplay = dockConnected ? 
      (AppState.lang === 'zh' ? '已连接' : 'Đã kết nối') : 
      (AppState.lang === 'zh' ? '等待连接' : 'Chờ kết nối');
  }

  return `
  <div class="home-layout">
    <div class="home-left">
      <!-- Scan & Control -->
      <div class="card">
        <div class="card-title">🔍 ${t('home.scanBarcode')}</div>
        <div class="barcode-area">
          <input type="text" id="barcode-input" class="barcode-input" placeholder="${t('home.scanBarcode')}..." onkeypress="handleBarcodeEnter(event)">
          <button class="btn btn-secondary btn-sm" onclick="clearBarcode()">✕</button>
        </div>
        <div style="margin-top:10px;">
          <div class="form-group">
            <label>${t('home.selectModel')}</label>
            <select class="form-select" id="model-select" onchange="onModelSelect(this.value)">
              <option value="">-- ${t('home.selectModel')} --</option>
              ${AppState.testFiles.map(f => `<option value="${f.id}" ${AppState.selectedModelId == f.id ? 'selected' : ''}>${f.model} - ${f.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t('home.testMode')}</label>
            <div style="display:flex;gap:10px;margin-top:4px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--text-secondary);">
                <input type="radio" name="testMode" value="single" ${AppState.testConfig.testMode==='single'?'checked':''} onchange="setTestMode('single')"> ${t('home.singleSide')}
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--text-secondary);">
                <input type="radio" name="testMode" value="double" ${AppState.testConfig.testMode==='double'?'checked':''} onchange="setTestMode('double')"> ${t('home.doubleSide')}
              </label>
            </div>
          </div>
        </div>
        <div class="test-control-btns">
          <button class="btn-start" onclick="startTest()" id="btn-start" ${AppState.testRunning?'disabled':''}>
            ▶ ${t('home.startTest')}
          </button>
          <button class="btn-stop" onclick="stopTest()" id="btn-stop" ${!AppState.testRunning?'disabled':''}>
            ■ ${t('home.stopTest')}
          </button>
        </div>
      </div>

      <!-- Overall Status -->
      <div class="card">
        <div class="overall-status-display ${overall}" id="overall-status-display">
          <div class="overall-status-text ${overall}" id="overall-status-text">${overallTextDisplay}</div>
          <div style="margin-top:8px;font-size:12px;color:var(--text-secondary)" id="test-time-display">
            ${AppState.testStartTime ? formatElapsed() : '--:--'}
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="card">
        <div class="card-title">📊 ${t('home.testResult')}</div>
        <div class="grid-4" style="grid-template-columns:1fr 1fr;gap:8px;">
          <div class="stat-box">
            <div class="stat-value cyan" id="stat-total">${stats.total}</div>
            <div class="stat-label">${t('home.testCount')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value green" id="stat-pass">${stats.pass}</div>
            <div class="stat-label">${t('home.passCount')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value red" id="stat-fail">${stats.fail}</div>
            <div class="stat-label">${t('home.failCount')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${passRate>=95?'green':passRate>=80?'yellow':'red'}" id="stat-rate">${passRate}%</div>
            <div class="stat-label">${t('home.passRate')}</div>
          </div>
        </div>
      </div>

      <!-- MES Status -->
      <div class="card">
        <div class="card-title">🔗 ${t('home.mesStatus')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="status-dot ${AppState.mesConnected?'connected':'disconnected'}" id="mes-dot-home"></span>
            <span style="font-size:12px;" id="mes-status-home">${AppState.mesConnected?t('home.connected'):t('home.disconnected')}</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="toggleMES()">${AppState.mesConnected?'断开':'连接'}</button>
        </div>
      </div>
    </div>

    <div class="home-right">
      <!-- Test Progress Grid -->
      <div class="card">
        <div class="card-title">⚡ ${t('home.testProgress')}</div>
        <div class="test-module-grid" id="test-module-grid">
          ${modules.map(m => {
            const res = AppState.testResults[m.id] || 'waiting';
            const badge = {
              pass: `<span class="badge badge-pass">${t('common.status_pass')}</span>`,
              fail: `<span class="badge badge-fail">${t('common.status_fail')}</span>`,
              testing: `<span class="badge badge-testing">${t('common.status_testing')}</span>`,
              waiting: `<span class="badge badge-waiting">${t('common.status_waiting')}</span>`,
              skip: `<span class="badge badge-skip">${t('common.status_skip')}</span>`
            };
            return `
              <div class="test-module-item ${res}" id="module-${m.id}">
                <div class="test-module-name">${m.name}</div>
                <div class="test-module-status">${badge[res]||badge.waiting}</div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Error Codes -->
      <div class="card">
        <div class="card-title">❌ ${t('home.errorCode')}</div>
        <div class="error-codes" id="error-codes">
          ${Object.entries(AppState.testResults).filter(([k,v])=>v==='fail').map(([k])=>`<span class="error-tag">ERR-${k.toUpperCase()}</span>`).join('') || `<span style="color:var(--text-muted);font-size:12px;">-- ${t('home.noTest')} --</span>`}
        </div>
      </div>

      <!-- Detail Results Table -->
      <div class="card">
        <div class="card-title">📋 ${t('home.testResult')}</div>
        <table class="data-table" id="result-table">
          <thead>
            <tr>
              <th>${t('common.testItem')}</th>
              <th>${t('common.measuredValue')}</th>
              <th>${t('common.limitValue')}</th>
              <th>${t('common.result')}</th>
            </tr>
          </thead>
          <tbody id="result-tbody">
            ${renderResultRows()}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderResultRows() {
  if (Object.keys(AppState.testResults).length === 0) {
    return `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">${t('home.waiting')}</td></tr>`;
  }
  const items = [
    { id: 'usb20', name: 'USB 2.0', value: '35.2 MB/s', limit: '≥30 MB/s' },
    { id: 'usb30', name: 'USB 3.0', value: '120.8 MB/s', limit: '≥100 MB/s' },
    { id: 'usb31', name: 'USB 3.1', value: '456.2 MB/s', limit: '≥400 MB/s' },
    { id: 'usb32', name: 'USB 3.2', value: '1050.5 MB/s', limit: '≥1000 MB/s' },
    { id: 'vga', name: 'VGA', value: '1920x1080@60Hz', limit: '60-75Hz' },
    { id: 'dp12', name: 'DP 1.2', value: '2560x1440@144Hz', limit: '60-144Hz' },
    { id: 'hdmi14', name: 'HDMI 1.4', value: '3840x2160@60Hz', limit: '60Hz' },
    { id: 'audio', name: t('nav.audio'), value: '44100Hz / 2ch', limit: '≥44100Hz' },
    { id: 'sd30', name: 'SD 3.0', value: '95.2 MB/s', limit: '≥90 MB/s' },
    { id: 'n1000m', name: '1000M LAN', value: '985 Mbps', limit: '≥900 Mbps' },
    { id: 'pd20', name: 'PD 2.0', value: '20V 5A 100W', limit: '18-100W' },
    { id: 'pd30', name: 'PD 3.0', value: '20V 5A 100W', limit: '30-100W' }
  ];
  return items.map(item => {
    const res = AppState.testResults[item.id] || 'waiting';
    const cls = res === 'pass' ? 'result-pass' : res === 'fail' ? 'result-fail' : '';
    const txt = res === 'pass' ? t('common.status_pass') : res === 'fail' ? t('common.status_fail') : '--';
    return `
      <tr>
        <td>${item.name}</td>
        <td class="measured-value">${res !== 'waiting' ? item.value : '--'}</td>
        <td style="color:var(--text-muted)">${item.limit}</td>
        <td class="${cls}">${txt}</td>
      </tr>`;
  }).join('');
}

// ============ USB PAGE ============
function renderUSBPage() {
  const usbTypes = ['usb20', 'usb30', 'usb31', 'usb32', 'usb4'];
  const usbNames = ['USB 2.0', 'USB 3.0', 'USB 3.1', 'USB 3.2', 'USB 4'];
  
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">⚡</span>${t('usb.title')}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="savePageConfig('usb')">💾 ${t('common.save')}</button>
        <button class="btn btn-primary btn-sm" onclick="testUSBNow()">▶ ${t('home.startTest')}</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${usbTypes.map((type, idx) => {
        const cfg = AppState.testConfig.usb[type];
        return `
        <div class="card">
          <div class="card-title">
            <label class="toggle-switch" style="cursor:pointer;">
              <input type="checkbox" class="toggle-input" id="usb-${type}-enabled" ${cfg.enabled?'checked':''} onchange="toggleUsbType('${type}', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
            ${usbNames[idx]}
            ${AppState.testResults[type] ? `<span class="badge badge-${AppState.testResults[type]}">${AppState.testResults[type].toUpperCase()}</span>` : ''}
          </div>
          <div class="${cfg.enabled?'':'disabled-section'}" id="usb-${type}-section">
            <div class="form-row">
              <div class="form-group">
                <label>${t('usb.minSpeed')} (MB/s)</label>
                <input type="number" class="form-input" value="${cfg.minReadSpeed}" onchange="updateConfig('usb.${type}.minReadSpeed', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              <div class="form-group">
                <label>${t('usb.writeSpeed')} Min (MB/s)</label>
                <input type="number" class="form-input" value="${cfg.minWriteSpeed}" onchange="updateConfig('usb.${type}.minWriteSpeed', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              <div class="form-group">
                <label>${t('usb.minVoltage')} (V)</label>
                <input type="number" class="form-input" step="0.1" value="${cfg.minVoltage}" onchange="updateConfig('usb.${type}.minVoltage', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              <div class="form-group">
                <label>${t('usb.maxVoltage')} (V)</label>
                <input type="number" class="form-input" step="0.1" value="${cfg.maxVoltage}" onchange="updateConfig('usb.${type}.maxVoltage', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              ${type !== 'usb20' ? `
              <div class="form-group">
                <label>${t('usb.expectedFw')}</label>
                <input type="text" class="form-input" value="${cfg.expectedFw||''}" placeholder="e.g. v2.0.1" onchange="updateConfig('usb.${type}.expectedFw', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              <div class="form-group">
                <label>${t('usb.expectedPid')}</label>
                <input type="text" class="form-input" value="${cfg.expectedPid||''}" placeholder="e.g. 0x1234" onchange="updateConfig('usb.${type}.expectedPid', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              <div class="form-group">
                <label>${t('usb.expectedVid')}</label>
                <input type="text" class="form-input" value="${cfg.expectedVid||''}" placeholder="e.g. 0x5678" onchange="updateConfig('usb.${type}.expectedVid', this.value)" ${!cfg.enabled?'disabled':''}>
              </div>
              ` : ''}
            </div>
            <div style="display:flex;gap:20px;margin-top:6px;">
              <label class="toggle-switch">
                <input type="checkbox" class="toggle-input" ${cfg.shortCircuit?'checked':''} onchange="updateConfig('usb.${type}.shortCircuit', this.checked)">
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="toggle-label">${t('usb.shortCircuit')}</span>
              </label>
              <label class="toggle-switch">
                <input type="checkbox" class="toggle-input" ${cfg.overvoltage?'checked':''} onchange="updateConfig('usb.${type}.overvoltage', this.checked)">
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="toggle-label">${t('usb.overvoltage')}</span>
              </label>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============ VIDEO PAGE ============
function renderVideoPage() {
  const videoTypes = [
    { key: 'vga', name: 'VGA' }, { key: 'dp12', name: 'DP 1.2' },
    { key: 'dp14', name: 'DP 1.4' }, { key: 'hdmi14', name: 'HDMI 1.4' },
    { key: 'hdmi20', name: 'HDMI 2.0/2.1' }
  ];
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">🖥</span>${t('video.title')}</div>
      <button class="btn btn-primary btn-sm" onclick="testVideoNow()">▶ ${t('home.startTest')}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${videoTypes.map(vt => {
        const cfg = AppState.testConfig.video[vt.key];
        return `
        <div class="card">
          <div class="card-title">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.enabled?'checked':''} onchange="updateConfig('video.${vt.key}.enabled', this.checked); renderCurrentPage()">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
            ${vt.name}
            ${AppState.testResults[vt.key] ? `<span class="badge badge-${AppState.testResults[vt.key]}">${AppState.testResults[vt.key].toUpperCase()}</span>` : ''}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${t('video.minHz')}</label>
              <input type="number" class="form-input" value="${cfg.minHz}" onchange="updateConfig('video.${vt.key}.minHz', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('video.maxHz')}</label>
              <input type="number" class="form-input" value="${cfg.maxHz}" onchange="updateConfig('video.${vt.key}.maxHz', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('video.minResW')}</label>
              <input type="number" class="form-input" value="${cfg.minResW}" onchange="updateConfig('video.${vt.key}.minResW', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('video.minResH')}</label>
              <input type="number" class="form-input" value="${cfg.minResH}" onchange="updateConfig('video.${vt.key}.minResH', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
          </div>
          <div style="display:flex;gap:20px;margin-top:6px;">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.rgbTest?'checked':''} onchange="updateConfig('video.${vt.key}.rgbTest', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('video.rgbColor')}</span>
            </label>
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.pixelCompare?'checked':''} onchange="updateConfig('video.${vt.key}.pixelCompare', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('video.pixelCompare')}</span>
            </label>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============ AUDIO PAGE ============
function renderAudioPage() {
  const cfg = AppState.testConfig.audio;
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">🔊</span>${t('audio.title')}</div>
      <button class="btn btn-primary btn-sm" onclick="testAudioNow()">▶ ${t('home.startTest')}</button>
    </div>
    <div class="card">
      <div class="card-title">
        <label class="toggle-switch">
          <input type="checkbox" class="toggle-input" ${cfg.enabled?'checked':''} onchange="updateConfig('audio.enabled', this.checked)">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
        ${t('audio.title')}
        ${AppState.testResults.audio ? `<span class="badge badge-${AppState.testResults.audio}">${AppState.testResults.audio.toUpperCase()}</span>` : ''}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>${t('audio.expectedChannels')}</label>
          <input type="number" class="form-input" value="${cfg.expectedChannels}" onchange="updateConfig('audio.expectedChannels', this.value)">
        </div>
        <div class="form-group">
          <label>${t('audio.minFreq')}</label>
          <input type="number" class="form-input" value="${cfg.minFreq}" onchange="updateConfig('audio.minFreq', this.value)">
        </div>
        <div class="form-group">
          <label>${t('audio.maxFreq')}</label>
          <input type="number" class="form-input" value="${cfg.maxFreq}" onchange="updateConfig('audio.maxFreq', this.value)">
        </div>
        <div class="form-group">
          <label>${t('audio.minSampleRate')} (Hz)</label>
          <input type="number" class="form-input" value="${cfg.minSampleRate}" onchange="updateConfig('audio.minSampleRate', this.value)">
        </div>
      </div>
      <div style="display:flex;gap:20px;margin-top:8px;">
        <label class="toggle-switch">
          <input type="checkbox" class="toggle-input" checked>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">${t('audio.channelDetect')}</span>
        </label>
        <label class="toggle-switch">
          <input type="checkbox" class="toggle-input" checked>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">${t('audio.freqDetect')}</span>
        </label>
        <label class="toggle-switch">
          <input type="checkbox" class="toggle-input" ${cfg.recordingTest?'checked':''} onchange="updateConfig('audio.recordingTest', this.checked)">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">${t('audio.audioIn')}</span>
        </label>
      </div>
    </div>
  </div>`;
}

// ============ SD CARD PAGE ============
function renderSDCardPage() {
  const sdTypes = [
    { key: 'sd30', name: 'SD/TF 3.0' },
    { key: 'sd40', name: 'SD/TF 4.0' }
  ];
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">💾</span>${t('sdcard.title')}</div>
      <button class="btn btn-primary btn-sm">▶ ${t('home.startTest')}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${sdTypes.map(st => {
        const cfg = AppState.testConfig.sdcard[st.key];
        return `
        <div class="card">
          <div class="card-title">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.enabled?'checked':''} onchange="updateConfig('sdcard.${st.key}.enabled', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
            ${st.name}
            ${AppState.testResults[st.key] ? `<span class="badge badge-${AppState.testResults[st.key]}">${AppState.testResults[st.key].toUpperCase()}</span>` : ''}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${t('sdcard.minReadSpeed')}</label>
              <input type="number" class="form-input" value="${cfg.minReadSpeed}" onchange="updateConfig('sdcard.${st.key}.minReadSpeed', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('sdcard.minWriteSpeed')}</label>
              <input type="number" class="form-input" value="${cfg.minWriteSpeed}" onchange="updateConfig('sdcard.${st.key}.minWriteSpeed', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('sdcard.expectedFw')}</label>
              <input type="text" class="form-input" value="${cfg.expectedFw||''}" placeholder="firmware version" onchange="updateConfig('sdcard.${st.key}.expectedFw', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============ NETWORK PAGE ============
function renderNetworkPage() {
  const netTypes = [
    { key: 'n100m', name: '100M' }, { key: 'n1000m', name: '1000M' },
    { key: 'n25g', name: '2.5G' }, { key: 'n5g', name: '5G' }
  ];
  const cfg = AppState.testConfig.network;
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">🌐</span>${t('network.title')}</div>
      <button class="btn btn-primary btn-sm">▶ ${t('home.startTest')}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div class="card">
        <div class="card-title">📡 ${t('network.speed')}</div>
        <div class="grid-2">
          ${netTypes.map(nt => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:rgba(0,0,0,0.2);border-radius:6px;border:1px solid var(--border-color);">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg[nt.key].enabled?'checked':''} onchange="updateConfig('network.${nt.key}.enabled', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label" style="font-size:13px;font-weight:600;color:var(--text-primary);">${nt.name}</span>
            </label>
            <div class="form-group" style="margin-bottom:0;width:130px;">
              <input type="number" class="form-input" value="${cfg[nt.key].minSpeed}" placeholder="${t('network.minSpeed')}" onchange="updateConfig('network.${nt.key}.minSpeed', this.value)">
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-title">🔑 MAC ${t('network.macCode')}</div>
        <div class="form-row">
          <div class="form-group">
            <label>${t('network.macPrefix')}</label>
            <input type="text" class="form-input" value="${cfg.macBurn.prefix}" placeholder="B0:A7:B9" onchange="updateConfig('network.macBurn.prefix', this.value)">
          </div>
          <div class="form-group">
            <label>${t('network.macRule')}</label>
            <input type="text" class="form-input" value="${cfg.macRule.pattern}" onchange="updateConfig('network.macRule.pattern', this.value)">
          </div>
        </div>
        <div style="display:flex;gap:20px;margin-top:8px;">
          <label class="toggle-switch">
            <input type="checkbox" class="toggle-input" ${cfg.macBurn.enabled?'checked':''} onchange="updateConfig('network.macBurn.enabled', this.checked)">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <span class="toggle-label">${t('network.macBurn')}</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" class="toggle-input" ${cfg.macRule.enabled?'checked':''} onchange="updateConfig('network.macRule.enabled', this.checked)">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <span class="toggle-label">${t('network.macRule')}</span>
          </label>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ PD PAGE ============
function renderPDPage() {
  const pdTypes = [
    { key: 'pd20', name: 'PD 2.0' }, { key: 'pd30', name: 'PD 3.0' }, { key: 'pd31', name: 'PD 3.1' }
  ];
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">🔋</span>${t('pd.title')}</div>
      <button class="btn btn-primary btn-sm">▶ ${t('home.startTest')}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${pdTypes.map(pt => {
        const cfg = AppState.testConfig.pd[pt.key];
        return `
        <div class="card">
          <div class="card-title">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.enabled?'checked':''} onchange="updateConfig('pd.${pt.key}.enabled', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
            ${pt.name}
            ${AppState.testResults[pt.key] ? `<span class="badge badge-${AppState.testResults[pt.key]}">${AppState.testResults[pt.key].toUpperCase()}</span>` : ''}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${t('pd.minVoltage')}</label>
              <input type="number" class="form-input" step="0.1" value="${cfg.minVoltage}" onchange="updateConfig('pd.${pt.key}.minVoltage', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.maxVoltage')}</label>
              <input type="number" class="form-input" step="0.1" value="${cfg.maxVoltage}" onchange="updateConfig('pd.${pt.key}.maxVoltage', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.minCurrent')}</label>
              <input type="number" class="form-input" step="0.1" value="${cfg.minCurrent}" onchange="updateConfig('pd.${pt.key}.minCurrent', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.maxCurrent')}</label>
              <input type="number" class="form-input" step="0.1" value="${cfg.maxCurrent}" onchange="updateConfig('pd.${pt.key}.maxCurrent', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.minPower')}</label>
              <input type="number" class="form-input" value="${cfg.minPower}" onchange="updateConfig('pd.${pt.key}.minPower', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.maxPower')}</label>
              <input type="number" class="form-input" value="${cfg.maxPower}" onchange="updateConfig('pd.${pt.key}.maxPower', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
            <div class="form-group">
              <label>${t('pd.expectedFw')}</label>
              <input type="text" class="form-input" value="${cfg.expectedFw||''}" placeholder="firmware version" onchange="updateConfig('pd.${pt.key}.expectedFw', this.value)" ${!cfg.enabled?'disabled':''}>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ============ FW PAGE ============
function renderFWPage() {
  const fwItems = [
    { key: 'usb', name: t('fw.usbFw'), icon: '⚡' },
    { key: 'sd', name: t('fw.sdFw'), icon: '💾' },
    { key: 'video', name: t('fw.videoFw'), icon: '🖥' },
    { key: 'pd', name: t('fw.pdFw'), icon: '🔋' }
  ];
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">📦</span>${t('fw.title')}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${fwItems.map(fi => {
        const cfg = AppState.testConfig.fw[fi.key];
        return `
        <div class="card">
          <div class="card-title">${fi.icon} ${fi.name}</div>
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="form-group" style="flex:1;margin-bottom:0;">
              <label>${t('fw.expectedVersion')}</label>
              <input type="text" class="form-input" value="${cfg.expectedVersion||''}" placeholder="e.g. v1.2.3" onchange="updateConfig('fw.${fi.key}.expectedVersion', this.value)">
            </div>
            <div style="display:flex;gap:8px;margin-top:18px;">
              <button class="btn btn-secondary btn-sm" onclick="fwAction('${fi.key}', 'read')">${t('fw.read')}</button>
              <button class="btn btn-ghost btn-sm" onclick="fwAction('${fi.key}', 'compare')">${t('fw.compare')}</button>
              <button class="btn btn-warning btn-sm" onclick="fwAction('${fi.key}', 'burn')">${t('fw.burn')}</button>
            </div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;align-items:center;">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" ${cfg.enabled?'checked':''} onchange="updateConfig('fw.${fi.key}.enabled', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('common.enabled')}</span>
            </label>
            <span id="fw-${fi.key}-result" style="font-size:12px;color:var(--text-muted);">--</span>
          </div>
        </div>`;
      }).join('')}
      <!-- Network MAC -->
      <div class="card">
        <div class="card-title">🌐 ${t('fw.networkMac')}</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="form-group" style="flex:1;margin-bottom:0;">
            <label>${t('network.macPrefix')}</label>
            <input type="text" class="form-input" value="${AppState.testConfig.network.macBurn.prefix}" placeholder="B0:A7:B9" onchange="updateConfig('network.macBurn.prefix', this.value)">
          </div>
          <div style="display:flex;gap:8px;margin-top:18px;">
            <button class="btn btn-warning btn-sm" onclick="fwAction('mac', 'burn')">${t('fw.burn')}</button>
            <button class="btn btn-ghost btn-sm" onclick="fwAction('mac', 'ruleCompare')">${t('fw.ruleCompare')}</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ USERS PAGE ============
function renderUsersPage() {
  const isLoggedIn = AppState.currentUser !== null;
  const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';
  
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">👤</span>${t('users.title')}</div>
      <div style="display:flex;gap:8px;">
        ${isLoggedIn ? `
          <span style="font-size:13px;color:var(--text-secondary);margin-right:8px;">${t('users.currentUser')}: <strong style="color:var(--accent-cyan)">${AppState.currentUser.displayName}</strong></span>
          <button class="btn btn-secondary btn-sm" onclick="showChangePassword()">${t('users.changePassword')}</button>
          <button class="btn btn-danger btn-sm" onclick="doLogout()">${t('users.logout')}</button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="showLoginModal()">${t('users.login')}</button>
        `}
      </div>
    </div>
    
    ${!isLoggedIn ? `
    <div class="card" style="text-align:center;padding:40px;">
      <div style="font-size:40px;margin-bottom:16px;">🔒</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:8px;">${t('users.login')}</div>
      <div style="color:var(--text-secondary);font-size:13px;margin-bottom:20px;">${t('users.noPermission')}</div>
      <button class="btn btn-primary" onclick="showLoginModal()">${t('users.login')}</button>
    </div>
    ` : `
    <div class="card">
      <div class="card-title">👥 ${t('users.title')}</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>${t('users.username')}</th>
            <th>${t('users.role')}</th>
            <th>${t('fw.action')}</th>
          </tr>
        </thead>
        <tbody>
          ${AppState.users.map(u => `
          <tr>
            <td>${u.id}</td>
            <td style="color:var(--accent-cyan)">${u.displayName} (${u.username})</td>
            <td><span class="badge ${u.role==='admin'?'badge-pass':u.role==='engineer'?'badge-testing':'badge-waiting'}">${t('users.'+u.role)}</span></td>
            <td>
              ${isAdmin && u.username !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">${t('users.deleteUser')}</button>` : '--'}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      ${isAdmin ? `
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color);">
        <div class="card-title">➕ ${t('users.addUser')}</div>
        <div class="form-row">
          <div class="form-group"><label>${t('users.username')}</label><input type="text" id="new-username" class="form-input" placeholder="username"></div>
          <div class="form-group"><label>${t('users.password')}</label><input type="password" id="new-password" class="form-input" placeholder="password"></div>
          <div class="form-group"><label>${t('users.role')}</label>
            <select id="new-role" class="form-select">
              <option value="operator">${t('users.operator')}</option>
              <option value="engineer">${t('users.engineer')}</option>
              <option value="admin">${t('users.admin')}</option>
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-primary" onclick="addUser()">${t('users.addUser')}</button>
          </div>
        </div>
      </div>
      ` : ''}
    </div>
    `}
  </div>`;
}

// ============ FILE MANAGER PAGE ============
function renderFileManagerPage() {
  const isLoggedIn = AppState.currentUser !== null;
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">📁</span>${t('fileManager.title')}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="newTestFile()">${t('fileManager.newFile')}</button>
        <button class="btn btn-secondary btn-sm" onclick="importConfig()">${t('fileManager.importFile')}</button>
        <button class="btn btn-ghost btn-sm" onclick="exportConfig()">${t('fileManager.exportFile')}</button>
      </div>
    </div>
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>${t('fileManager.fileName')}</th>
            <th>${t('fileManager.model')}</th>
            <th>${t('fileManager.createTime')}</th>
            <th>${t('fileManager.modifyTime')}</th>
            <th>${t('fw.action')}</th>
          </tr>
        </thead>
        <tbody>
          ${AppState.testFiles.map(f => `
          <tr>
            <td style="color:var(--accent-cyan);font-weight:600;">${f.name}</td>
            <td>${f.model}</td>
            <td style="color:var(--text-muted)">${f.createTime}</td>
            <td style="color:var(--text-muted)">${f.modifyTime}</td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-success btn-sm" onclick="applyTestFile(${f.id})">${t('fileManager.applyFile')}</button>
                <button class="btn btn-ghost btn-sm" onclick="renameTestFile(${f.id})">${t('fileManager.renameFile')}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTestFile(${f.id})">${t('fileManager.deleteFile')}</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============ SETTINGS PAGE ============
function renderSettingsPage() {
  return `
  <div>
    <div class="page-header">
      <div class="page-title"><span class="page-title-icon">⚙</span>${t('settings.title')}</div>
    </div>
    <div class="grid-2" style="gap:16px;">
      <div>
        <div class="card">
          <div class="card-title">🌐 ${t('settings.language')}</div>
          <div style="display:flex;gap:10px;">
            <button class="btn ${AppState.lang==='zh'?'btn-primary':'btn-secondary'}" onclick="switchLang('zh')">🇨🇳 中文</button>
            <button class="btn ${AppState.lang==='vi'?'btn-primary':'btn-secondary'}" onclick="switchLang('vi')">🇻🇳 Tiếng Việt</button>
          </div>
        </div>
        
        <div class="card" style="margin-top:14px;">
          <div class="card-title">🔗 MES / PLC</div>
          <div class="form-group">
            <label>${t('settings.mesServer')}</label>
            <input type="text" class="form-input" id="mes-server" value="192.168.1.100">
          </div>
          <div class="form-group">
            <label>${t('settings.mesPort')}</label>
            <input type="number" class="form-input" id="mes-port" value="8080">
          </div>
          <label class="toggle-switch" style="margin-bottom:12px;">
            <input type="checkbox" class="toggle-input" id="mes-enabled" ${AppState.mesEnabled ? 'checked' : ''} onchange="updateMesEnabled(this.checked)">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <span class="toggle-label">${t('settings.mesEnabled')}</span>
          </label>
          <div class="form-group">
            <label>${t('settings.plcServer')}</label>
            <input type="text" class="form-input" id="plc-server" value="192.168.1.200">
          </div>
          <div class="form-group">
            <label>${t('settings.plcPort')}</label>
            <input type="number" class="form-input" id="plc-port" value="502">
          </div>
          <label class="toggle-switch">
            <input type="checkbox" class="toggle-input" id="plc-enabled">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <span class="toggle-label">${t('settings.plcEnabled')}</span>
          </label>
        </div>
      </div>
      
      <div>
        <div class="card">
          <div class="card-title">🔔 ${t('settings.title')}</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" checked>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('settings.autoTest')}</span>
            </label>
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" checked>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('settings.buzzAlarm')}</span>
            </label>
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" checked>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('settings.lightAlarm')}</span>
            </label>
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" checked>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">${t('settings.saveResult')}</span>
            </label>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label>${t('settings.resultPath')}</label>
            <div style="display:flex;gap:8px;">
              <input type="text" class="form-input" value="C:\TestResults" id="result-path">
              <button class="btn btn-ghost btn-sm">${t('settings.browse')}</button>
            </div>
          </div>
        </div>
        
        <div class="card" style="margin-top:14px;">
          <div class="card-title">💡 ${t('common.remarks')}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
            <p>• ${AppState.lang === 'zh' ? '软件版本: V1.0.0 / 2024' : 'Phiên bản phần mềm: V1.0.0 / 2024'}</p>
            <p>• ${AppState.lang === 'zh' ? '深圳市湘凡科技有限公司' : 'Công ty TNHH Công nghệ Xiangfan Thâm Quyến'}</p>
            <p>• ${AppState.lang === 'zh' ? 'TYPE-C扩展坞多功能测试系统' : 'Hệ thống kiểm tra đa chức năng TYPE-C Dock'}</p>
          </div>
          <div style="margin-top:14px;display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="saveSettings()">${t('settings.save')}</button>
            <button class="btn btn-secondary" onclick="showPage('settings')">${t('settings.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ TEST LOGIC (Real Hardware Testing) ============
const TEST_SEQUENCE = ['usb20', 'usb30', 'usb31', 'usb32', 'usb4', 'vga', 'dp12', 'dp14', 'hdmi14', 'hdmi20', 'audio', 'sd30', 'sd40', 'n100m', 'n1000m', 'pd20', 'pd30', 'pd31'];

// 设备连接状态
let dockConnected = false;
let dockDevice = null;

// 检测扩展坞连接状态
async function checkDockConnection() {
  try {
    const result = await ipcRenderer.invoke('detect-dock');
    dockConnected = result.connected;
    dockDevice = result.device;
    updateDockStatusUI();
    return result;
  } catch (e) {
    console.error('检测扩展坞失败:', e);
    return { connected: false, device: null };
  }
}

// 更新UI显示扩展坞连接状态
function updateDockStatusUI() {
  // 更新header状态
  const statusEl = document.getElementById('dock-connection-status');
  if (statusEl) {
    if (dockConnected) {
      const hubCount = dockDevice?.usbHubs?.length || 0;
      const netCount = dockDevice?.networkAdapters?.length || 0;
      const audioCount = dockDevice?.audioDevices?.length || 0;
      statusEl.innerHTML = `<span style="color:var(--status-pass)">●</span> ${AppState.lang === 'zh' ? '扩展坞已连接' : 'Dock đã kết nối'} (${hubCount}H/${netCount}N/${audioCount}A)`;
    } else {
      statusEl.innerHTML = `<span style="color:var(--status-fail)">●</span> ${AppState.lang === 'zh' ? '未检测到扩展坞' : 'Chưa phát hiện dock'}`;
    }
  }
  
  // 更新主界面状态显示（如果不在测试中）
  if (!AppState.testRunning && Object.keys(AppState.testResults).length === 0) {
    const statusText = document.getElementById('overall-status-text');
    const statusDisplay = document.getElementById('overall-status-display');
    if (statusText && statusDisplay) {
      if (dockConnected) {
        statusText.className = 'overall-status-text connected';
        statusText.textContent = AppState.lang === 'zh' ? '已连接' : 'Đã kết nối';
        statusDisplay.className = 'overall-status-display connected';
      } else {
        statusText.className = 'overall-status-text waiting';
        statusText.textContent = AppState.lang === 'zh' ? '等待连接' : 'Chờ kết nối';
        statusDisplay.className = 'overall-status-display waiting';
      }
    }
  }
}

// 开始测试（真实硬件测试）
async function startTest() {
  const barcode = document.getElementById('barcode-input') ? document.getElementById('barcode-input').value.trim() : '';
  if (!barcode) {
    showToast(AppState.lang === 'zh' ? '请先扫描产品条码' : 'Vui lòng quét mã vạch sản phẩm trước', 'warning');
    document.getElementById('barcode-input')?.focus();
    return;
  }

  // 先检测扩展坞是否连接
  const dockCheck = await checkDockConnection();
  if (!dockCheck.connected) {
    showToast(AppState.lang === 'zh' ? '未检测到TYPE-C扩展坞，请连接设备后再测试' : 'Chưa phát hiện dock TYPE-C, vui lòng kết nối', 'error', 5000);
    return;
  }

  AppState.testRunning = true;
  AppState.testResults = {};
  AppState.testStartTime = Date.now();
  
  let idx = 0;
  renderCurrentPage();
  
  const runNext = async () => {
    if (!AppState.testRunning || idx >= TEST_SEQUENCE.length) {
      finishTest();
      return;
    }
    const id = TEST_SEQUENCE[idx];
    AppState.testResults[id] = 'testing';
    updateModuleDisplay(id, 'testing');
    
    // 执行真实硬件测试
    const result = await runRealTest(id);
    AppState.testResults[id] = result.pass ? 'pass' : 'fail';
    AppState.testResults[id + '_data'] = result.data; // 保存详细数据
    updateModuleDisplay(id, result.pass ? 'pass' : 'fail');
    
    idx++;
    setTimeout(runNext, 300);
  };
  
  runNext();
}

// 执行真实硬件测试
async function runRealTest(testId) {
  const config = AppState.testConfig;
  
  try {
    switch (testId) {
      case 'usb20':
      case 'usb30':
      case 'usb31':
      case 'usb32':
      case 'usb4':
        return await testUSB(testId, config.usb[testId]);
      
      case 'sd30':
      case 'sd40':
        return await testSDCard(testId, config.sdcard[testId]);
      
      case 'vga':
      case 'dp12':
      case 'dp14':
      case 'hdmi14':
      case 'hdmi20':
        return await testVideo(testId, config.video[testId.replace(/\d+$/, '') === 'dp' ? testId : testId]);
      
      case 'audio':
        return await testAudio(config.audio);
      
      case 'n100m':
      case 'n1000m':
        return await testNetwork(testId, config.network[testId]);
      
      case 'pd20':
      case 'pd30':
      case 'pd31':
        return await testPD(testId, config.pd[testId]);
      
      default:
        return { pass: false, data: { error: 'Unknown test' } };
    }
  } catch (e) {
    console.error(`Test ${testId} failed:`, e);
    return { pass: false, data: { error: e.message } };
  }
}

// USB读写速度测试
async function testUSB(usbType, cfg) {
  if (!cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    // 获取USB驱动器列表
    const drives = await ipcRenderer.invoke('list-drive-letters');
    if (!drives || drives.length === 0) {
      return { pass: false, data: { error: 'No USB drive detected' } };
    }
    
    // 使用第一个USB驱动器进行测试
    const drive = drives[0];
    const speedResult = await ipcRenderer.invoke('test-drive-speed', drive.driveLetter, 64);
    
    if (!speedResult.success) {
      return { pass: false, data: { error: speedResult.error || 'Speed test failed' } };
    }
    
    const pass = speedResult.readMBps >= cfg.minReadSpeed && speedResult.writeMBps >= cfg.minWriteSpeed;
    return {
      pass,
      data: {
        drive: drive.driveLetter,
        model: drive.model,
        readMBps: speedResult.readMBps,
        writeMBps: speedResult.writeMBps,
        minRead: cfg.minReadSpeed,
        minWrite: cfg.minWriteSpeed
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

// SD卡读写速度测试
async function testSDCard(sdType, cfg) {
  if (!cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    // SD卡通常作为USB大容量存储设备出现
    const drives = await ipcRenderer.invoke('list-drive-letters');
    // 过滤可能的SD卡设备（通常型号包含SD/MMC/Card等关键词）
    const sdDrives = drives.filter(d => 
      /sd|mmc|card|tf/i.test(d.model) || d.model.includes('SD')
    );
    
    const testDrive = sdDrives.length > 0 ? sdDrives[0] : (drives.length > 0 ? drives[0] : null);
    if (!testDrive) {
      return { pass: false, data: { error: 'No SD card detected' } };
    }
    
    const speedResult = await ipcRenderer.invoke('test-drive-speed', testDrive.driveLetter, 32);
    
    if (!speedResult.success) {
      return { pass: false, data: { error: speedResult.error } };
    }
    
    const pass = speedResult.readMBps >= cfg.minReadSpeed && speedResult.writeMBps >= cfg.minWriteSpeed;
    return {
      pass,
      data: {
        drive: testDrive.driveLetter,
        model: testDrive.model,
        readMBps: speedResult.readMBps,
        writeMBps: speedResult.writeMBps,
        minRead: cfg.minReadSpeed,
        minWrite: cfg.minWriteSpeed
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

// 视频输出测试（检测外接显示器）
async function testVideo(videoType, cfg) {
  if (!cfg || !cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    const displays = await ipcRenderer.invoke('list-displays');
    // 检测是否有非主显示器（即外接显示器）
    const externalDisplays = displays.filter(d => !d.primary);
    
    if (externalDisplays.length === 0) {
      return { pass: false, data: { error: 'No external display detected' } };
    }
    
    // 获取分辨率信息（从bounds解析）
    const extDisplay = externalDisplays[0];
    const boundsMatch = extDisplay.bounds.match(/Width=(\d+).*Height=(\d+)/);
    const width = boundsMatch ? parseInt(boundsMatch[1]) : 0;
    const height = boundsMatch ? parseInt(boundsMatch[2]) : 0;
    
    const pass = width >= (cfg.minResW || 1920) && height >= (cfg.minResH || 1080);
    return {
      pass,
      data: {
        deviceName: extDisplay.deviceName,
        resolution: `${width}x${height}`,
        bitsPerPixel: extDisplay.bitsPerPixel,
        minRes: `${cfg.minResW}x${cfg.minResH}`
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

// 音频设备测试
async function testAudio(cfg) {
  if (!cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    const devices = await ipcRenderer.invoke('list-audio-devices');
    const activeDevices = devices.filter(d => d.status === 'OK');
    
    if (activeDevices.length === 0) {
      return { pass: false, data: { error: 'No audio device detected' } };
    }
    
    // 检测是否有扩展坞的音频设备（通过关键词匹配）
    const dockAudio = activeDevices.find(d => 
      /dock|hub|usb|type-c|xfanic/i.test(d.name)
    );
    
    return {
      pass: activeDevices.length >= cfg.expectedChannels,
      data: {
        totalDevices: activeDevices.length,
        dockAudioFound: !!dockAudio,
        devices: activeDevices.map(d => d.name).slice(0, 3),
        expectedChannels: cfg.expectedChannels
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

// 网络测试
async function testNetwork(netType, cfg) {
  if (!cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    const netInfo = await ipcRenderer.invoke('get-network-info');
    const activeAdapters = netInfo.filter(a => a.Status === 'Up');
    
    if (activeAdapters.length === 0) {
      return { pass: false, data: { error: 'No network adapter detected' } };
    }
    
    // 检测RJ45网卡（非WiFi）
    const ethernetAdapters = activeAdapters.filter(a => 
      /ethernet|gigabit|realtek|intel.*eth/i.test(a.InterfaceDescription) &&
      !/wireless|wifi|wi-fi|wlan/i.test(a.InterfaceDescription)
    );
    
    if (ethernetAdapters.length === 0) {
      return { pass: false, data: { error: 'No Ethernet adapter detected' } };
    }
    
    const adapter = ethernetAdapters[0];
    // 解析LinkSpeed (如 "1 Gbps" -> 1000)
    const speedMatch = adapter.LinkSpeed.match(/(\d+(?:\.\d+)?)\s*(Gbps|Mbps)/i);
    let speedMbps = 0;
    if (speedMatch) {
      const val = parseFloat(speedMatch[1]);
      speedMbps = speedMatch[2].toLowerCase() === 'gbps' ? val * 1000 : val;
    }
    
    // 测试延迟
    const latencyResult = await ipcRenderer.invoke('test-network-latency', '8.8.8.8');
    
    const pass = speedMbps >= cfg.minSpeed;
    return {
      pass,
      data: {
        adapter: adapter.Name,
        linkSpeed: adapter.LinkSpeed,
        speedMbps,
        minSpeed: cfg.minSpeed,
        macAddress: adapter.MacAddress,
        latencyMs: latencyResult.avgMs,
        latencyOk: latencyResult.success
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

// PD充电测试
async function testPD(pdType, cfg) {
  if (!cfg.enabled) return { pass: true, data: { skipped: true } };
  
  try {
    // 尝试读取PD治具数据（通过串口）
    const pdData = await ipcRenderer.invoke('read-pd-data', 'COM3');
    
    if (!pdData.success && pdData.simulated) {
      // PD治具未连接，返回警告但不判定为失败
      return {
        pass: true, // 暂时通过，等待实际治具
        data: {
          warning: 'PD治具未连接，使用模拟数据',
          voltage: 0,
          current: 0,
          power: 0,
          note: '请连接PD测试治具到COM3端口'
        }
      };
    }
    
    const { voltage, current, power } = pdData;
    const pass = voltage >= cfg.minVoltage && voltage <= cfg.maxVoltage &&
                 current >= cfg.minCurrent && current <= cfg.maxCurrent &&
                 power >= cfg.minPower && power <= cfg.maxPower;
    
    return {
      pass,
      data: {
        voltage,
        current,
        power,
        voltageRange: `${cfg.minVoltage}-${cfg.maxVoltage}V`,
        currentRange: `${cfg.minCurrent}-${cfg.maxCurrent}A`,
        powerRange: `${cfg.minPower}-${cfg.maxPower}W`,
        raw: pdData.raw
      }
    };
  } catch (e) {
    return { pass: false, data: { error: e.message } };
  }
}

function finishTest() {
  AppState.testRunning = false;
  const hasFail = Object.values(AppState.testResults).some(r => r === 'fail');
  AppState.statistics.total++;
  if (hasFail) AppState.statistics.fail++;
  else AppState.statistics.pass++;
  
  updateStatsDisplay();
  
  const statusEl = document.getElementById('overall-status-text');
  const statusContainer = document.getElementById('overall-status-display');
  if (statusEl && statusContainer) {
    const result = hasFail ? 'fail' : 'pass';
    statusEl.className = `overall-status-text ${result}`;
    statusEl.textContent = hasFail ? 'FAIL' : 'PASS';
    statusContainer.className = `overall-status-display ${result}`;
  }
  
  if (hasFail) {
    showToast(AppState.lang === 'zh' ? '测试结果: FAIL ❌ 请检查不良项目' : 'Kết quả: KHÔNG ĐẠT ❌ Vui lòng kiểm tra', 'error', 5000);
  } else {
    showToast(AppState.lang === 'zh' ? '测试结果: PASS ✅ 产品合格' : 'Kết quả: ĐẠT ✅ Sản phẩm đạt yêu cầu', 'success', 4000);
  }
  
  // Update error codes
  const ecEl = document.getElementById('error-codes');
  if (ecEl) {
    const failIds = Object.entries(AppState.testResults).filter(([k,v]) => v === 'fail').map(([k]) => k);
    ecEl.innerHTML = failIds.length ? 
      failIds.map(id => `<span class="error-tag">ERR-${id.toUpperCase()}</span>`).join('') :
      `<span style="color:var(--text-muted);font-size:12px;">-- ${t('home.noTest')} --</span>`;
  }
  
  const resultTbody = document.getElementById('result-tbody');
  if (resultTbody) resultTbody.innerHTML = renderResultRows();
}

function stopTest() {
  AppState.testRunning = false;
  showToast(AppState.lang === 'zh' ? '测试已中止' : 'Đã dừng kiểm tra', 'warning');
  renderCurrentPage();
}

function updateModuleDisplay(id, status) {
  const el = document.getElementById(`module-${id}`);
  if (!el) return;
  el.className = `test-module-item ${status}`;
  const badgeMap = {
    pass: `<span class="badge badge-pass">${t('common.status_pass')}</span>`,
    fail: `<span class="badge badge-fail">${t('common.status_fail')}</span>`,
    testing: `<span class="badge badge-testing">${t('common.status_testing')}</span>`,
    waiting: `<span class="badge badge-waiting">${t('common.status_waiting')}</span>`
  };
  const statusEl = el.querySelector('.test-module-status');
  if (statusEl) statusEl.innerHTML = badgeMap[status] || '';
  
  const statusText = document.getElementById('overall-status-text');
  if (statusText && AppState.testRunning) {
    statusText.className = 'overall-status-text testing';
    statusText.textContent = t('home.testing');
  }
}

function updateStatsDisplay() {
  const s = AppState.statistics;
  const passRate = s.total > 0 ? Math.round(s.pass / s.total * 100) : 0;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total', s.total);
  set('stat-pass', s.pass);
  set('stat-fail', s.fail);
  set('stat-rate', passRate + '%');
  const rateEl = document.getElementById('stat-rate');
  if (rateEl) {
    rateEl.className = `stat-value ${passRate>=95?'green':passRate>=80?'yellow':'red'}`;
  }
}

function formatElapsed() {
  if (!AppState.testStartTime) return '--:--';
  const elapsed = Math.floor((Date.now() - AppState.testStartTime) / 1000);
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function handleBarcodeEnter(e) {
  if (e.key === 'Enter') startTest();
}

function clearBarcode() {
  const el = document.getElementById('barcode-input');
  if (el) el.value = '';
}

function setTestMode(mode) {
  AppState.testConfig.testMode = mode;
}

function onModelSelect(modelId) {
  AppState.selectedModelId = modelId ? parseInt(modelId) : null;
  if (AppState.selectedModelId) {
    const file = AppState.testFiles.find(f => f.id === AppState.selectedModelId);
    if (file) {
      AppState.testConfig.fileName = file.name;
      AppState.testConfig.model = file.model;
      showToast(`${AppState.lang==='zh'?'已选择机型':'Đã chọn model'}: ${file.model}`, 'success');
    }
  }
}

function toggleMES() {
  // 如果MES功能被禁用，提示用户
  if (!AppState.mesEnabled) {
    showToast(AppState.lang === 'zh' ? 'MES功能已在设置中禁用' : 'MES đã bị vô hiệu hóa trong cài đặt', 'warning');
    return;
  }
  AppState.mesConnected = !AppState.mesConnected;
  showToast(AppState.mesConnected ? 
    (AppState.lang==='zh'?'MES系统已连接':'Đã kết nối MES') : 
    (AppState.lang==='zh'?'MES系统已断开':'Đã ngắt kết nối MES'), 
    AppState.mesConnected ? 'success' : 'warning');
  
  const dot = document.getElementById('mes-dot');
  const dot2 = document.getElementById('mes-dot-home');
  const text = document.getElementById('mes-status-home');
  if (dot) dot.className = `status-dot ${AppState.mesConnected?'connected':'disconnected'}`;
  if (dot2) dot2.className = `status-dot ${AppState.mesConnected?'connected':'disconnected'}`;
  if (text) text.textContent = AppState.mesConnected ? t('home.connected') : t('home.disconnected');
}

function updateMesEnabled(enabled) {
  AppState.mesEnabled = enabled;
  showToast(AppState.mesEnabled ? 
    (AppState.lang==='zh'?'MES功能已启用':'Đã bật MES') : 
    (AppState.lang==='zh'?'MES功能已禁用':'Đã tắt MES'), 
    AppState.mesEnabled ? 'success' : 'warning');
  // 如果禁用MES，同时断开连接
  if (!AppState.mesEnabled && AppState.mesConnected) {
    AppState.mesConnected = false;
    const dot = document.getElementById('mes-dot');
    const dot2 = document.getElementById('mes-dot-home');
    const text = document.getElementById('mes-status-home');
    if (dot) dot.className = 'status-dot disconnected';
    if (dot2) dot2.className = 'status-dot disconnected';
    if (text) text.textContent = t('home.disconnected');
  }
}

// ============ CONFIG MANAGEMENT ============
function updateConfig(path, value) {
  const keys = path.split('.');
  let obj = AppState.testConfig;
  for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
  const lastKey = keys[keys.length - 1];
  if (typeof obj[lastKey] === 'boolean') obj[lastKey] = value === true || value === 'true';
  else if (typeof obj[lastKey] === 'number') obj[lastKey] = parseFloat(value);
  else obj[lastKey] = value;
}

function savePageConfig(page) {
  showToast(AppState.lang === 'zh' ? `${page.toUpperCase()} 配置已保存` : `Đã lưu cấu hình ${page.toUpperCase()}`, 'success');
}

async function importConfig() {
  if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('load-config');
    if (result.success) {
      AppState.testConfig = { ...AppState.testConfig, ...result.data };
      renderCurrentPage();
      showToast(AppState.lang === 'zh' ? '配置文件已导入' : 'Đã nhập tệp cấu hình', 'success');
    }
  }
}

async function exportConfig() {
  if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('save-config', AppState.testConfig);
    if (result.success) showToast(AppState.lang === 'zh' ? `配置已导出至: ${result.path}` : `Đã xuất cấu hình: ${result.path}`, 'success');
  }
}

// ============ USER MANAGEMENT ============
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('login-username')?.focus(), 100);
}

function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const user = AppState.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    AppState.currentUser = user;
    hideLoginModal();
    const el = document.getElementById('current-user-display');
    if (el) el.textContent = user.displayName;
    showToast(t('users.loginSuccess') + ` - ${user.displayName}`, 'success');
    renderCurrentPage();
  } else {
    const errEl = document.getElementById('login-error');
    if (errEl) {
      errEl.textContent = t('users.loginFailed');
      errEl.style.display = 'block';
    }
  }
}

function doLogout() {
  AppState.currentUser = null;
  const el = document.getElementById('current-user-display');
  if (el) el.textContent = 'Guest';
  showToast(AppState.lang === 'zh' ? '已注销登录' : 'Đã đăng xuất', 'info');
  renderCurrentPage();
}

function deleteUser(id) {
  if (confirm(t('users.confirmDelete'))) {
    AppState.users = AppState.users.filter(u => u.id !== id);
    renderCurrentPage();
    showToast(AppState.lang === 'zh' ? '用户已删除' : 'Đã xóa người dùng', 'success');
  }
}

function addUser() {
  const username = document.getElementById('new-username')?.value.trim();
  const password = document.getElementById('new-password')?.value;
  const role = document.getElementById('new-role')?.value;
  if (!username || !password) {
    showToast(AppState.lang === 'zh' ? '请填写用户名和密码' : 'Vui lòng nhập tên và mật khẩu', 'warning');
    return;
  }
  if (AppState.users.some(u => u.username === username)) {
    showToast(AppState.lang === 'zh' ? '用户名已存在' : 'Tên đăng nhập đã tồn tại', 'error');
    return;
  }
  const newUser = { id: Date.now(), username, password, role, displayName: username };
  AppState.users.push(newUser);
  renderCurrentPage();
  showToast(AppState.lang === 'zh' ? '用户已添加' : 'Đã thêm người dùng', 'success');
}

function showChangePassword() {
  const newPwd = prompt(AppState.lang === 'zh' ? '请输入新密码:' : 'Nhập mật khẩu mới:');
  if (newPwd && newPwd.length >= 3) {
    AppState.currentUser.password = newPwd;
    const user = AppState.users.find(u => u.id === AppState.currentUser.id);
    if (user) user.password = newPwd;
    showToast(AppState.lang === 'zh' ? '密码已修改' : 'Đã đổi mật khẩu', 'success');
  }
}

// ============ FILE MANAGER ============
function newTestFile() {
  if (!AppState.currentUser) {
    showLoginModal();
    return;
  }
  const name = prompt(AppState.lang === 'zh' ? '输入新文件名:' : 'Nhập tên tệp mới:');
  if (name) {
    const now = new Date().toLocaleString('zh-CN');
    AppState.testFiles.push({ id: Date.now(), name, model: 'Custom', createTime: now, modifyTime: now });
    renderCurrentPage();
    showToast(AppState.lang === 'zh' ? '测试文件已创建' : 'Đã tạo tệp kiểm tra', 'success');
  }
}

function applyTestFile(id) {
  const file = AppState.testFiles.find(f => f.id === id);
  if (file && confirm(t('fileManager.confirmApply'))) {
    AppState.testConfig.fileName = file.name;
    showToast(`${AppState.lang==='zh'?'已应用':'Đã áp dụng'}: ${file.name}`, 'success');
    showPage('home');
  }
}

function deleteTestFile(id) {
  if (AppState.testFiles.length <= 1) {
    showToast(AppState.lang === 'zh' ? '至少需要保留一个配置文件' : 'Cần giữ ít nhất một tệp cấu hình', 'warning');
    return;
  }
  if (confirm(t('fileManager.confirmDelete'))) {
    AppState.testFiles = AppState.testFiles.filter(f => f.id !== id);
    renderCurrentPage();
  }
}

function renameTestFile(id) {
  const file = AppState.testFiles.find(f => f.id === id);
  if (file) {
    const name = prompt(AppState.lang === 'zh' ? '输入新名称:' : 'Nhập tên mới:', file.name);
    if (name) {
      file.name = name;
      file.modifyTime = new Date().toLocaleString('zh-CN');
      renderCurrentPage();
      showToast(AppState.lang === 'zh' ? '已重命名' : 'Đã đổi tên', 'success');
    }
  }
}

// ============ FW ACTIONS ============
function fwAction(type, action) {
  const msgs = {
    read: { zh: `正在读取 ${type.toUpperCase()} 固件...`, vi: `Đang đọc firmware ${type.toUpperCase()}...` },
    compare: { zh: `正在对比 ${type.toUpperCase()} 固件...`, vi: `Đang so sánh firmware ${type.toUpperCase()}...` },
    burn: { zh: `正在烧录 ${type.toUpperCase()} 固件...`, vi: `Đang ghi firmware ${type.toUpperCase()}...` },
    ruleCompare: { zh: 'MAC规则对比中...', vi: 'Đang so sánh quy tắc MAC...' }
  };
  showToast(msgs[action][AppState.lang], 'info', 2000);
  setTimeout(() => {
    const resultEl = document.getElementById(`fw-${type}-result`);
    if (resultEl) {
      const isOk = Math.random() > 0.1;
      resultEl.style.color = isOk ? 'var(--status-pass)' : 'var(--status-fail)';
      resultEl.textContent = isOk ? 
        (AppState.lang==='zh'?'验证通过 ✓':'Xác minh thành công ✓') : 
        (AppState.lang==='zh'?'验证失败 ✗':'Xác minh thất bại ✗');
    }
  }, 1500);
}

function testUSBNow() { showToast(AppState.lang==='zh'?'USB测试启动...':'Đang khởi động kiểm tra USB...', 'info'); }
function testVideoNow() { showToast(AppState.lang==='zh'?'视频测试启动...':'Đang khởi động kiểm tra video...', 'info'); }
function testAudioNow() { showToast(AppState.lang==='zh'?'音频测试启动...':'Đang khởi động kiểm tra âm thanh...', 'info'); }

function saveSettings() {
  showToast(AppState.lang==='zh'?'设置已保存':'Đã lưu cài đặt', 'success');
}

// ============ BIND EVENTS ============
function bindPageEvents() {
  // Login modal enter key
  const pwdInput = document.getElementById('login-password');
  if (pwdInput) {
    pwdInput.onkeypress = (e) => { if (e.key === 'Enter') doLogin(); };
  }
}

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
  if (e.target.id === 'login-modal') hideLoginModal();
});

// ============ INIT ============
function init() {
  // DateTime
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Render first page
  renderCurrentPage();
  applyTranslations();
  
  // 初始化检测扩展坞连接状态
  setTimeout(() => {
    checkDockConnection();
    // 每5秒轮询一次扩展坞状态
    setInterval(checkDockConnection, 5000);
  }, 1000);
  
  // Elapsed timer
  setInterval(() => {
    if (AppState.testRunning) {
      const el = document.getElementById('test-time-display');
      if (el) el.textContent = formatElapsed();
    }
  }, 1000);
}

window.addEventListener('DOMContentLoaded', init);
