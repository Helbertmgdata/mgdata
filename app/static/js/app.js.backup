// =====================================================================
//  InteliMon -- Cruip Template Integration -- CORE JAVASCRIPT
// =====================================================================

// ==================== GLOBAL STATE & CONFIG ====================
let autoRefreshInterval = null;
let dataState = {};
let loadedTabs = new Set(['dashboard']);
const chartInstances = {};
const tabState = {
    logs: { data: [], search: '', eventsBound: false },
    history: { data: [], search: '', eventsBound: false },
    credentials: {},
};
const SERVICE_LABELS = {
    postmark: 'Postmark',
    mailgun: 'Mailgun',
    pmg: 'PMG',
    server: 'Servidor',
    cpanel: 'cPanel / WHM',
    whm: 'cPanel / WHM',
};
const STATUS_STYLES = {
    success: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    warning: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
    error: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    info: { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' },
};
const credentialBlueprint = [
    {
        key: 'postmark',
        apiService: 'postmark',
        title: 'Postmark',
        subtitle: 'Envios transacionais e alertas criticos',
        statusKeys: ['server_token_valid', 'account_token_valid'],
        icon: 'mail',
        fields: [
            { name: 'server_token', label: 'Server Token', type: 'password', placeholder: 'POSTMARK_SERVER_TOKEN', prefill: false, autocomplete: 'off' },
            { name: 'account_token', label: 'Account Token', type: 'password', placeholder: 'POSTMARK_ACCOUNT_TOKEN', prefill: false, autocomplete: 'off' },
        ],
    },
    {
        key: 'mailgun',
        apiService: 'mailgun',
        title: 'Mailgun',
        subtitle: 'Monitoramento global e supressoes',
        statusKeys: ['api_key_valid'],
        icon: 'paper-airplane',
        fields: [
            { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'MAILGUN_API_KEY', prefill: false, autocomplete: 'off' },
            { name: 'domain', label: 'Dominio principal', type: 'text', placeholder: 'ex: mg.seudominio.com', prefill: true },
            { name: 'region', label: 'Regiao', type: 'select', default: 'us', options: [{ value: 'us', label: 'US' }, { value: 'eu', label: 'EU' }], prefill: true },
        ],
    },
    {
        key: 'pmg',
        apiService: 'pmg',
        title: 'Proxmox Mail Gateway',
        subtitle: 'Fila, quarentena e top senders',
        statusKeys: ['auth_valid'],
        icon: 'shield',
        fields: [
            { name: 'host', label: 'Host ou IP do PMG', type: 'text', placeholder: 'pmg.exemplo.local', prefill: true },
            { name: 'password', label: 'Senha root@pam', type: 'password', placeholder: 'Senha administrativa', prefill: false, autocomplete: 'off' },
        ],
    },
    {
        key: 'server',
        apiService: 'server',
        title: 'Servidor Linux',
        subtitle: 'Coleta de metricas via SSH',
        statusKeys: ['ssh_valid'],
        icon: 'chip',
        fields: [
            { name: 'host', label: 'Host ou IP', type: 'text', placeholder: 'server.exemplo.local', prefill: true },
            { name: 'port', label: 'Porta SSH', type: 'number', placeholder: '22', default: '22', prefill: true },
            { name: 'password', label: 'Senha root', type: 'password', placeholder: 'Senha root', prefill: false, autocomplete: 'off' },
        ],
    },
    {
        key: 'whm',
        apiService: 'cpanel',
        title: 'cPanel / WHM',
        subtitle: 'Inventario completo de contas',
        statusKeys: ['api_token_valid'],
        icon: 'stack',
        fields: [
            { name: 'host', label: 'Host do WHM', type: 'text', placeholder: 'https://whm.seudominio.com:2087', prefill: true },
            { name: 'api_token', label: 'API Token', type: 'password', placeholder: 'WHM_API_TOKEN', prefill: false, autocomplete: 'off' },
        ],
    },
];

// Chart.js Global Config for Cruip Dark Theme
Chart.defaults.color = '#94a3b8'; // slate-400
Chart.defaults.borderColor = '#334155'; // slate-700
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.enabled = true;
Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b'; // slate-800
Chart.defaults.plugins.tooltip.titleColor = '#f1f5f9'; // slate-100
Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1'; // slate-300
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 4;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('[SYSTEM] InteliMon Cruip Initializing...');
        setupSidebar();
        setupTabs();
        loadTabData('dashboard');
    } catch (error) {
        console.error('[FATAL] Initialization failed:', error);
        document.body.innerHTML = `<div class="p-4 text-red-500">Erro Critico na Inicializacao: ${error.message}</div>`;
    }
});

// ==================== UI & CORE SYSTEMS ====================
function setupSidebar() {
    // Basic sidebar functionality if needed, for now template is mostly CSS driven
    // In a real scenario, this would handle localStorage for sidebar state, etc.
    console.log('Sidebar setup complete.');
}

function setupTabs() {
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.dataset.tab;
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            const activePane = document.getElementById(`tab-${tabName}`);
            if (activePane) activePane.classList.add('active');

            if (!loadedTabs.has(tabName)) {
                loadTabData(tabName);
                loadedTabs.add(tabName);
            }
        });
    });
}

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) throw new Error(`API Error ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`[FETCH_ERROR]/${endpoint}:`, error);
        return { status: 'error', error: error.message };
    }
}

function loadTabData(tabName) {
    console.log(`[SYSTEM] Loading data for tab: ${tabName}`);
    if (tabName === 'dashboard') {
        loadDashboardData();
    } else if (tabName === 'logs') {
        loadLogsTab();
    } else if (tabName === 'historico') {
        loadHistoryTab();
    } else if (tabName === 'credentials') {
        loadCredentialsTab();
    }
}

async function loadDashboardData() {
    const endpoints = ['server', 'postmark', 'mailgun', 'pmg', 'cpanel'];
    endpoints.forEach(endpoint => {
        const container = document.getElementById(`${endpoint}-card`);
        if (container) container.innerHTML = createLoader();
    });

    await Promise.all([
        loadServiceData('server', renderServerPanel),
        loadServiceData('postmark', renderEmailPanel),
        loadServiceData('mailgun', renderEmailPanel),
        loadServiceData('pmg', renderPMGPanel),
        loadServiceData('cpanel', renderCpanelPanel),
    ]);
    updateSummary();
    updateLastUpdate();
}

async function refreshAllData() {
    loadedTabs.clear();
    loadTabData('dashboard');
    loadedTabs.add('dashboard');
}

async function loadServiceData(endpoint, renderer) {
    const data = await fetchAPI(endpoint);
    dataState[endpoint] = data;
    try {
        renderer(endpoint, data);
    } catch (err) {
        console.error(`[RENDER_ERROR] ${endpoint}:`, err);
        const container = document.getElementById(`${endpoint}-card`);
        if (container) container.innerHTML = createErrorCard(endpoint.toUpperCase(), err.message);
    }
}

// ==================== LOGS TAB ====================
function bindLogsEvents() {
    if (tabState.logs.eventsBound) return;
    const selectEl = document.getElementById('log-service-filter');
    const searchEl = document.getElementById('log-search');
    const refreshBtn = document.getElementById('logs-refresh-btn');

    if (selectEl) {
        selectEl.addEventListener('change', () => loadLogsTab());
    }
    if (searchEl) {
        searchEl.addEventListener('input', (event) => {
            tabState.logs.search = event.target.value || '';
            renderLogsTable();
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadLogsTab());
    }
    tabState.logs.eventsBound = true;
}

async function loadLogsTab() {
    bindLogsEvents();
    setLogsPlaceholder('Carregando logs...');
    const filter = document.getElementById('log-service-filter')?.value || 'all';
    let endpoint = 'logs';
    if (filter && filter !== 'all') {
        endpoint += `?service=${encodeURIComponent(filter)}`;
    }
    const response = await fetchAPI(endpoint);
    if (response.status !== 'success') {
        setLogsPlaceholder(response.error || 'Erro ao carregar logs.');
        return;
    }
    tabState.logs.data = response.logs || [];
    renderLogsTable();
}

function renderLogsTable() {
    const body = document.getElementById('logs-table-body');
    if (!body) return;
    const searchTerm = (document.getElementById('log-search')?.value || '').toLowerCase();
    tabState.logs.search = searchTerm;

    const filtered = (tabState.logs.data || []).filter(entry => {
        if (!searchTerm) return true;
        const haystack = `${entry.service || ''} ${entry.action || ''} ${entry.message || ''}`.toLowerCase();
        return haystack.includes(searchTerm);
    });

    if (!filtered.length) {
        setLogsPlaceholder('Nenhum log encontrado para o filtro atual.');
        return;
    }

    const rows = filtered.slice(0, 150).map(entry => {
        const statusHtml = buildStatusBadge(entry.status || 'info');
        return `
            <tr class="hover:bg-gray-900/60 transition-colors">
                <td class="p-3 whitespace-nowrap text-gray-300">${formatDateTime(entry.timestamp)}</td>
                <td class="p-3 whitespace-nowrap text-gray-400">${friendlyServiceName(entry.service)}</td>
                <td class="p-3 whitespace-nowrap text-gray-200 font-semibold">${entry.action || '--'}</td>
                <td class="p-3 whitespace-nowrap">${statusHtml}</td>
                <td class="p-3 text-gray-300 text-sm">${entry.message ? escapeHtml(entry.message) : '--'}</td>
            </tr>`;
    }).join('');

    body.innerHTML = rows;
}

function setLogsPlaceholder(message) {
    const body = document.getElementById('logs-table-body');
    if (body) {
        body.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">${message}</td></tr>`;
    }
}

// ==================== HISTORY TAB ====================
function bindHistoryEvents() {
    if (tabState.history.eventsBound) return;
    const searchEl = document.getElementById('history-search');
    const refreshBtn = document.getElementById('history-refresh-btn');

    if (searchEl) {
        searchEl.addEventListener('input', (event) => {
            tabState.history.search = event.target.value || '';
            renderHistoryTimeline();
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadHistoryTab());
    }
    tabState.history.eventsBound = true;
}

async function loadHistoryTab() {
    bindHistoryEvents();
    setHistoryPlaceholder('Carregando historico...');
    const response = await fetchAPI('historico');
    if (response.status !== 'success') {
        setHistoryPlaceholder(response.error || 'Erro ao carregar historico.');
        return;
    }
    tabState.history.data = response.history || [];
    renderHistoryTimeline();
}

function renderHistoryTimeline() {
    const container = document.getElementById('history-timeline');
    if (!container) return;
    const searchTerm = (document.getElementById('history-search')?.value || '').toLowerCase();
    tabState.history.search = searchTerm;

    const filtered = (tabState.history.data || []).filter(item => {
        if (!searchTerm) return true;
        const haystack = `${item.title || ''} ${item.detail || ''} ${item.service || ''}`.toLowerCase();
        return haystack.includes(searchTerm);
    });

    if (!filtered.length) {
        setHistoryPlaceholder('Nenhum evento encontrado.');
        return;
    }

    const timelineItems = filtered.slice(0, 80).map(item => `
        <li class="relative flex gap-4 pl-6">
            <span class="absolute left-0 top-2 w-3 h-3 rounded-full border border-gray-900 bg-indigo-400 shadow-lg shadow-indigo-500/30"></span>
            <div class="flex-1 bg-gray-900/40 border border-gray-800 rounded-lg p-4">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                        <p class="text-sm text-gray-400">${formatDateTime(item.timestamp)}</p>
                        <h3 class="text-base font-semibold text-gray-100">${item.title || 'Evento'}</h3>
                    </div>
                    ${item.service ? `<span class="px-2 py-1 rounded-full text-xs font-semibold border border-gray-700 text-gray-200 bg-gray-800/70">${friendlyServiceName(item.service)}</span>` : ''}
                </div>
                <p class="text-sm text-gray-300">${item.detail ? escapeHtml(item.detail) : 'Sem detalhes adicionais.'}</p>
            </div>
        </li>`).join('');

    container.innerHTML = `
        <div class="relative">
            <div class="absolute left-1.5 top-0 bottom-0 w-px bg-gray-700/80"></div>
            <ul class="space-y-5">${timelineItems}</ul>
        </div>`;
}

function setHistoryPlaceholder(message) {
    const container = document.getElementById('history-timeline');
    if (container) {
        container.innerHTML = `<div class="text-center text-gray-500 py-6">${message}</div>`;
    }
}

// ==================== CREDENTIALS TAB ====================
async function loadCredentialsTab() {
    const grid = document.getElementById('credentials-grid');
    showAlert('credentials-alert', '');
    if (grid) {
        grid.innerHTML = `<div class="col-span-full">${createLoader()}</div>`;
    }
    const response = await fetchAPI('credentials');
    if (response.status !== 'success') {
        if (grid) {
            grid.innerHTML = `<div class="col-span-full text-center text-red-400 py-8">${response.error || 'Erro ao carregar credenciais.'}</div>`;
        }
        showAlert('credentials-alert', 'error', response.error || 'Erro ao carregar credenciais.');
        return;
    }
    tabState.credentials = response;
    renderCredentialCards(response);
}

function renderCredentialCards(payload) {
    const grid = document.getElementById('credentials-grid');
    if (!grid) return;
    const cards = credentialBlueprint.map(config => buildCredentialCard(config, payload[config.key] || {})).join('');
    grid.innerHTML = cards;
    bindCredentialForms();
}

function buildCredentialCard(config, data) {
    const statusInfo = getCredentialStatus(config, data);
    const lastCheck = buildLastCheckInfo(data?.last_check);
    const fieldsHtml = config.fields.map(field => buildCredentialField(config, field, data)).join('');
    return `
        <form class="flex flex-col bg-gray-900/40 border border-gray-800 rounded-lg p-5 space-y-4" data-credential-form="${config.key}">
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                    <div class="p-2 rounded-full bg-gray-800 border border-gray-700 text-indigo-400">
                        ${getCredentialIcon(config.icon)}
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wide text-gray-500">${friendlyServiceName(config.apiService)}</p>
                        <h2 class="text-lg font-semibold text-gray-100">${config.title}</h2>
                        <p class="text-xs text-gray-500">${config.subtitle}</p>
                    </div>
                </div>
                ${buildStatusBadge(statusInfo.tone, statusInfo.label)}
            </div>
            <div class="space-y-3">
                ${fieldsHtml}
            </div>
            <div class="text-xs text-gray-500">${lastCheck}</div>
            <div class="flex flex-wrap gap-3 pt-2">
                <button type="submit" class="px-4 py-2 text-sm font-semibold rounded bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">Salvar</button>
                <button type="button" data-test-service="${config.apiService}" class="px-4 py-2 text-sm font-semibold rounded border border-gray-600 text-gray-200 hover:text-indigo-200 hover:border-indigo-400 transition-colors">Testar conexao</button>
            </div>
        </form>`;
}

function buildCredentialField(config, field, data) {
    const inputId = `${config.key}-${field.name}`;
    const baseClasses = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';
    const shouldPrefill = field.prefill !== false;
    const defaultValue = field.prefill === false ? '' : (field.default ?? '');
    const value = shouldPrefill ? (data?.[field.name] ?? defaultValue ?? '') : '';
    if (field.type === 'select') {
        const options = (field.options || []).map(option => {
            const selected = String(value || '').toLowerCase() === String(option.value).toLowerCase() ? 'selected' : '';
            return `<option value="${option.value}" ${selected}>${option.label}</option>`;
        }).join('');
        return `
            <label class="block">
                <span class="text-xs font-semibold text-gray-400">${field.label}</span>
                <select id="${inputId}" name="${field.name}" class="${baseClasses} mt-1">
                    ${options}
                </select>
            </label>`;
    }
    return `
        <label class="block">
            <span class="text-xs font-semibold text-gray-400">${field.label}</span>
            <input id="${inputId}" name="${field.name}" type="${field.type || 'text'}" value="${escapeAttribute(value)}" autocomplete="${field.autocomplete || 'off'}" placeholder="${field.placeholder || ''}" class="${baseClasses} mt-1" />
        </label>`;
}

function bindCredentialForms() {
    document.querySelectorAll('[data-credential-form]').forEach(form => {
        const key = form.getAttribute('data-credential-form');
        const config = credentialBlueprint.find(item => item.key === key);
        if (!config) return;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleCredentialSave(form, config);
        });
    });
    document.querySelectorAll('[data-test-service]').forEach(button => {
        button.addEventListener('click', async () => {
            const service = button.getAttribute('data-test-service');
            await handleCredentialTest(service, button);
        });
    });
}

async function handleCredentialSave(form, config) {
    const saveButton = form.querySelector('button[type="submit"]');
    setButtonLoading(saveButton, true);
    const payload = {};
    config.fields.forEach(field => {
        const input = form.querySelector(`[name="${field.name}"]`);
        if (!input) return;
        payload[field.name] = input.value?.trim() ?? '';
    });
    const response = await postJSON(`credentials/${config.apiService}`, payload);
    setButtonLoading(saveButton, false);
    if (response.status === 'success') {
        showAlert('credentials-alert', 'success', `${config.title}: credenciais atualizadas com sucesso.`);
        await loadCredentialsTab();
    } else {
        showAlert('credentials-alert', 'error', response.error || response.message || 'Erro ao salvar credenciais.');
    }
}

async function handleCredentialTest(service, button) {
    setButtonLoading(button, true);
    const response = await postJSON(`test/${service}`, {});
    setButtonLoading(button, false);
    const tone = response.status === 'success' ? 'success' : response.status === 'warning' ? 'warning' : 'error';
    const message = response.message || response.error || 'Teste executado.';
    showAlert('credentials-alert', tone, `${friendlyServiceName(service)}: ${message}`);
    if (response.status !== 'error') {
        await loadCredentialsTab();
    }
}

async function postJSON(endpoint, payload) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload || {}),
        });
        return await response.json();
    } catch (error) {
        console.error(`[POST_ERROR] ${endpoint}`, error);
        return { status: 'error', error: error.message };
    }
}

// ==================== DASHBOARD RENDERERS ====================

function renderStatCard(id, title, value, change = null) {
    const container = document.getElementById(id);
    if (!container) return;

    let changeHtml = '';
    if (change) {
        const isPositive = change.startsWith('+');
        const colorClass = isPositive ? 'text-emerald-500' : 'text-red-500';
        changeHtml = `<div class="text-xs font-semibold ${colorClass} px-1.5 bg-emerald-500/10 rounded-full">${change}</div>`;
    }

    container.innerHTML = `
        <div class="px-5 py-4">
            <div class="flex items-start">
                <div class="text-3xl font-bold text-gray-100 mr-2">${value}</div>
                ${changeHtml}
            </div>
        </div>
        <div class="text-sm font-semibold text-gray-400 px-5 pb-4">${title}</div>`;
}

function renderServerPanel(endpoint, data) {
    const container = document.getElementById('server-card');
    if (data.status === 'error') {
        container.innerHTML = createErrorCard('Server Status', data.error);
        return;
    }
    const { cpu = {}, memory = {}, disk = {} } = data;
    container.innerHTML = `
        <div class="flex flex-col col-span-full sm:col-span-6 bg-gray-800 shadow-lg rounded-sm border border-gray-700">
            <header class="px-5 py-4 border-b border-gray-700">
                <h2 class="font-semibold text-gray-200">Server Status</h2>
            </header>
            <div class="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                ${createGauge('CPU', cpu.usage)}
                ${createGauge('Memory', memory.percent)}
                ${createGauge('Disk', disk.percent)}
            </div>
        </div>`;
}

function createGauge(label, value) {
    const percentage = value || 0;
    const color = percentage > 85 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#22c55e';
    return `
        <div class="text-center">
            <div class="text-3xl font-bold text-white">${percentage}%</div>
            <div class="text-sm font-medium text-gray-500">${label}</div>
        </div>`;
}

function renderEmailPanel(endpoint, data) {
    const container = document.getElementById(`${endpoint}-card`);
    const title = endpoint === 'postmark' ? 'Postmark' : 'Mailgun';
    if (data.status === 'error') {
        container.innerHTML = createErrorCard(title, data.error);
        return;
    }
    
    let sent = 0;
    if (endpoint === 'postmark') sent = data['24h']?.sent || 0;
    else sent = Number(data['24h']?.delivered ?? data['24h']?.accepted ?? 0);

    container.innerHTML = `
        <header class="px-5 py-4 border-b border-gray-700 flex items-center">
            <h2 class="font-semibold text-gray-200">${title}</h2>
        </header>
        <div class="p-5">
            <div class="text-center mb-4">
                <div class="text-sm text-gray-500">Envios (24h)</div>
                <div class="text-3xl font-bold text-white">${formatNumber(sent)}</div>
            </div>
            <div class="h-40"><canvas id="chart-${endpoint}"></canvas></div>
        </div>`;
    
    const chartData = endpoint === 'postmark' 
        ? [data['24h']?.unique_opens || 0, data['24h']?.unique_clicks || 0, data['24h']?.bounced || 0]
        : [data['24h']?.opened || 0, data['24h']?.clicked || 0, data['24h']?.failed || 0];
        
    renderDoughnutChart(`chart-${endpoint}`, chartData, ['Aberturas', 'Cliques', 'Falhas']);
}

function renderPMGPanel(endpoint, data) {
    const container = document.getElementById('pmg-card');
    if (data.status === 'error') {
        container.innerHTML = createErrorCard('Proxmox MG', data.error);
        return;
    }
    const stats = data.statistics || {};
    const queueCount = data.queue?.count || 0;
    const filtered = stats.count_in || 0;
    const spam = stats.spamcount_in || 0;
    const virus = stats.viruscount_in || 0;

    container.innerHTML = `
        <header class="px-5 py-4 border-b border-gray-700">
            <h2 class="font-semibold text-gray-200">Proxmox MG</h2>
        </header>
        <div class="p-5">
            <div class="text-center mb-4">
                <div class="text-sm text-gray-500">E-mails em Fila</div>
                <div class="text-3xl font-bold text-white">${formatNumber(queueCount)}</div>
            </div>
            <div class="h-40"><canvas id="chart-${endpoint}"></canvas></div>
        </div>`;
    
    renderBarChart(`chart-${endpoint}`, [filtered, spam, virus], ['Filtrados', 'Spam', 'Virus']);
}

function renderCpanelPanel(endpoint, data) {
    const container = document.getElementById('cpanel-card');
    if (data.status === 'error') {
        container.innerHTML = createErrorCard('cPanel/WHM', data.error);
        return;
    }
    const accounts = Array.isArray(data.accounts) ? data.accounts : [];
    const accountListHtml = accounts.length 
        ? accounts.map(acc => `
            <tr class="hover:bg-gray-700">
                <td class="p-2"><div class="font-medium text-gray-100">${acc.domain || acc.user}</div></td>
                <td class="p-2"><div class="text-center">${acc.email_accounts || 0}</div></td>
                <td class="p-2"><div class="text-center">${acc.disk_used}</div></td>
                <td class="p-2">
                    <div class="text-center font-medium ${acc.suspended ? 'text-yellow-500' : 'text-emerald-500'}">
                        ${acc.suspended ? 'Suspenso' : 'Ativo'}
                    </div>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="4" class="p-4 text-center text-gray-500">Nenhuma conta encontrada.</td></tr>`;

    container.innerHTML = `
        <header class="px-5 py-4 border-b border-gray-700">
            <h2 class="font-semibold text-gray-200">Contas cPanel/WHM</h2>
        </header>
        <div class="p-3">
            <div class="overflow-x-auto">
                <table class="table-auto w-full">
                    <thead class="text-xs font-semibold uppercase text-gray-500 bg-gray-900">
                        <tr>
                            <th class="p-2"><div class="font-semibold text-left">Dominio</div></th>
                            <th class="p-2"><div class="font-semibold text-center">E-mails</div></th>
                            <th class="p-2"><div class="font-semibold text-center">Uso de Disco</div></th>
                            <th class="p-2"><div class="font-semibold text-center">Status</div></th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-gray-700">
                        ${accountListHtml}
                    </tbody>
                </table>
            </div>
        </div>`;
}

// ==================== CHART RENDERERS ====================
function destroyChart(canvasId) {
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
}

function renderDoughnutChart(canvasId, data, labels) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#3b82f6', '#22d3ee', '#facc15'],
                hoverBackgroundColor: ['#2563eb', '#06b6d4', '#eab308'],
                borderColor: '#1f293b', // slate-800
                borderWidth: 2,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '80%' }
    });
}

function renderBarChart(canvasId, data, labels) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: '#3b82f6',
                hoverBackgroundColor: '#2563eb',
                barPercentage: 0.66,
                categoryPercentage: 0.66,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ==================== UTILITIES ====================
function formatNumber(num) { return (num === null || num === undefined) ? '-' : num.toLocaleString('pt-BR'); }
function updateLastUpdate() {
    const el = document.getElementById('last-update');
    if (el) el.textContent = new Date().toLocaleTimeString('pt-BR');
}

function updateSummary() {
    const pmSent = dataState.postmark?.['24h']?.sent || 0;
    const mgSent = Number(dataState.mailgun?.['24h']?.delivered ?? 0);
    const totalSent = pmSent + mgSent;
    const totalOpens = (dataState.postmark?.['24h']?.opens || 0) + (dataState.mailgun?.['24h']?.opens || 0);
    const openRate = totalSent ? `${((totalOpens / totalSent) * 100).toFixed(1)}%` : '--';
    
    renderStatCard('summary-total-sent-card', 'Envios (24h)', formatNumber(totalSent));
    renderStatCard('summary-open-rate-card', 'Taxa de Abertura', openRate);
    renderStatCard('summary-pmg-queue-card', 'Fila PMG', formatNumber(dataState.pmg?.queue?.count));
    renderStatCard('summary-whm-accounts-card', 'Contas WHM', formatNumber(dataState.cpanel?.accounts?.length));
}

function createLoader() {
    return `<div class="flex justify-center items-center h-full p-8"><div class="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div></div>`;
}

function createErrorCard(title, error) {
    return `
        <header class="px-5 py-4 border-b border-gray-700">
            <h2 class="font-semibold text-gray-200">${title}</h2>
        </header>
        <div class="p-5 text-center">
            <div class="font-semibold text-red-500">Erro ao carregar</div>
            <div class="text-sm text-gray-500">${error}</div>
        </div>`;
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function friendlyServiceName(service) {
    if (!service) return '--';
    return SERVICE_LABELS[service] || service.charAt(0).toUpperCase() + service.slice(1);
}

function getCredentialStatus(config, data) {
    const keys = Array.isArray(config.statusKeys) ? config.statusKeys : [config.statusKeys];
    const isValid = keys.every(key => data && data[key]);
    return {
        tone: isValid ? 'success' : 'warning',
        label: isValid ? 'Ativo' : 'Pendente',
    };
}

function buildLastCheckInfo(info) {
    if (!info) {
        return 'Nenhum teste executado ainda.';
    }
    const tone = getStatusTone(info.status);
    const label = formatStatusLabel(info.status);
    const message = info.message ? ` - ${escapeHtml(info.message)}` : '';
    return `Ultimo teste em ${formatDateTime(info.timestamp)} - ${label}${message}`;
}

function getCredentialIcon(type) {
    const icons = {
        mail: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.511l-8 5.333-8-5.333V6h16ZM4 18V8.489l7.445 4.964a1 1 0 0 0 1.11 0L20 8.489V18H4Z"/></svg>',
        'paper-airplane': '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="m22 2-7 20-4-9-9-4 20-7Zm-9.465 10.283 2.085 4.695 3.502-10.006-5.587 5.311ZM6.028 9.79l4.693 2.086 5.312-5.588L6.028 9.79Z"/></svg>',
        shield: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5.55 3.84 10.74 8 11.5 4.16-.76 8-5.95 8-11.5V5l-8-3Z"/></svg>',
        chip: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 9h6v6H9z"/><path d="M20 8h-2V4h-4V2H10v2H6v4H4v8h2v4h4v2h4v-2h4v-4h2V8ZM8 18v-2H6v-4H4v-2h2V6h2V4h2V2h2v2h2v2h2v2h2v4h2v2h-2v4h-2v2h-2v2h-2v-2h-2v-2H8Z"/></svg>',
        stack: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="m12 1 10 5-10 5L2 6l10-5Zm0 9 10 5-10 5-10-5 10-5Zm-10 7 10 5 10-5v2l-10 5-10-5v-2Z"/></svg>',
    };
    return icons[type] || icons.mail;
}

function getStatusTone(status) {
    const value = (status || '').toString().toLowerCase();
    if (['success', 'ok', 'online', 'ativo'].includes(value)) return 'success';
    if (['warning', 'warn', 'partial', 'pendente'].includes(value)) return 'warning';
    if (['error', 'fail', 'failed', 'erro'].includes(value)) return 'error';
    return 'info';
}

function formatStatusLabel(status) {
    const tone = getStatusTone(status);
    const defaultLabels = {
        success: 'Sucesso',
        warning: 'Aviso',
        error: 'Erro',
        info: typeof status === 'string' && status ? status : 'Info',
    };
    if (tone !== 'info') return defaultLabels[tone];
    return defaultLabels.info;
}

function buildStatusBadge(status, labelOverride) {
    const tone = getStatusTone(status);
    const toneStyle = STATUS_STYLES[tone] || STATUS_STYLES.info;
    const label = labelOverride || formatStatusLabel(status);
    return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${toneStyle.bg} ${toneStyle.text} border ${toneStyle.border}">${label}</span>`;
}

function showAlert(targetId, tone, message) {
    const container = document.getElementById(targetId);
    if (!container) return;
    if (!message) {
        container.innerHTML = '';
        return;
    }
    const toneStyle = STATUS_STYLES[getStatusTone(tone)] || STATUS_STYLES.info;
    container.innerHTML = `<div class="mb-4 px-4 py-3 rounded border ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text}">${message}</div>`;
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeAttribute(value = '') {
    return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }
        button.disabled = true;
        button.classList.add('opacity-70', 'cursor-not-allowed');
        button.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4l5-5-5-5v4a12 12 0 0 0-12 12h4Z"></path></svg>Processando...</span>`;
    } else {
        button.disabled = false;
        button.classList.remove('opacity-70', 'cursor-not-allowed');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}
