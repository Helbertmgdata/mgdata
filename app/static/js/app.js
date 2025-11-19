// =====================================================================
//  InteliMon Dashboard v4.0 - Professional Monitoring Interface
// =====================================================================

console.log('[INTELIMON] Initializing Dashboard v4.0...');

// ==================== GLOBAL STATE ====================
const state = {
    data: {},
    charts: {},
    autoRefresh: false,
    refreshInterval: null,
    currentTab: 'dashboard',
    timeRange: '24h'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[INIT] DOM Content Loaded');
    
    // Initialize components
    initNavigation();
    initAutoRefresh();
    initTimeRange();
    
    // Load initial data
    loadAllData();
    
    // Setup refresh button
    document.getElementById('refresh-all-btn')?.addEventListener('click', () => {
        console.log('[REFRESH] Manual refresh triggered');
        loadAllData();
    });
    
    console.log('[INIT] Dashboard initialized successfully');
});

// ==================== NAVIGATION ====================
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    console.log(`[NAV] Switching to tab: ${tabName}`);
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.classList.add('hidden');
    });
    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) {
        activePane.classList.remove('hidden');
        activePane.classList.add('active');
    }
    
    // Update header
    updatePageHeader(tabName);
    
    // Load tab-specific data
    loadTabData(tabName);
    
    state.currentTab = tabName;
}

function updatePageHeader(tabName) {
    const titles = {
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Visão geral de todos os serviços monitorados'
        },
        logs: {
            title: 'Logs de Sistema',
            subtitle: 'Histórico de eventos e ações do sistema'
        },
        history: {
            title: 'Histórico de Métricas',
            subtitle: 'Análise temporal de desempenho e recursos'
        },
        credentials: {
            title: 'Credenciais',
            subtitle: 'Gerenciamento de APIs e configurações'
        }
    };
    
    const config = titles[tabName] || titles.dashboard;
    document.getElementById('page-title').textContent = config.title;
    document.getElementById('page-subtitle').textContent = config.subtitle;
}

// ==================== AUTO REFRESH ====================
function initAutoRefresh() {
    const toggle = document.getElementById('auto-refresh-toggle');
    
    toggle?.addEventListener('change', (e) => {
        state.autoRefresh = e.target.checked;
        
        if (state.autoRefresh) {
            console.log('[AUTO-REFRESH] Enabled (30s interval)');
            state.refreshInterval = setInterval(() => {
                loadAllData();
            }, 30000); // 30 seconds
        } else {
            console.log('[AUTO-REFRESH] Disabled');
            if (state.refreshInterval) {
                clearInterval(state.refreshInterval);
                state.refreshInterval = null;
            }
        }
    });
}

// ==================== TIME RANGE ====================
function initTimeRange() {
    const selector = document.getElementById('time-range-selector');
    
    selector?.addEventListener('change', (e) => {
        state.timeRange = e.target.value;
        console.log(`[TIME-RANGE] Changed to: ${state.timeRange}`);
        loadAllData();
    });
}

// ==================== DATA LOADING ====================
async function loadAllData() {
    console.log('[DATA] Loading all data...');
    updateLastSyncTime();
    
    try {
        // Load all services in parallel
        await Promise.all([
            loadPostmarkData(),
            loadMailgunData(),
            loadPMGData(),
            loadServerData(),
            loadCPanelData()
        ]);
        
        // Update KPIs
        updateKPIs();
        
        // Update charts
        updateCharts();
        
        console.log('[DATA] All data loaded successfully');
    } catch (error) {
        console.error('[DATA] Error loading data:', error);
    }
}

async function loadTabData(tabName) {
    console.log(`[TAB-DATA] Loading data for: ${tabName}`);
    
    switch (tabName) {
        case 'dashboard':
            // Already loaded by loadAllData
            break;
        case 'logs':
            await loadLogs();
            break;
        case 'history':
            await loadHistory();
            break;
        case 'credentials':
            await loadCredentials();
            break;
    }
}

// ==================== POSTMARK ====================
async function loadPostmarkData() {
    try {
        const response = await fetch('/api/postmark');
        const data = await response.json();
        
        state.data.postmark = data;
        
        // Update card
        const container = document.getElementById('postmark-data');
        const badge = document.getElementById('postmark-status-badge');
        
        if (data.success) {
            badge.textContent = 'Online';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-success';
            
            container.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Enviados (24h)</span>
                        <span class="text-lg font-bold text-white">${formatNumber(data.sent_24h || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Taxa de Abertura</span>
                        <span class="text-lg font-bold text-success">${formatPercent(data.open_rate || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Taxa de Bounce</span>
                        <span class="text-lg font-bold ${(data.bounce_rate || 0) > 5 ? 'text-danger' : 'text-warning'}">${formatPercent(data.bounce_rate || 0)}</span>
                    </div>
                </div>
            `;
        } else {
            badge.textContent = 'Offline';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-danger';
            
            container.innerHTML = `
                <div class="text-sm text-gray-500">
                    <p>${data.error || 'Erro ao carregar dados'}</p>
                    <p class="text-xs mt-2">Verifique as credenciais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('[POSTMARK] Error:', error);
    }
}

// ==================== MAILGUN ====================
async function loadMailgunData() {
    try {
        const response = await fetch('/api/mailgun');
        const data = await response.json();
        
        state.data.mailgun = data;
        
        const container = document.getElementById('mailgun-data');
        const badge = document.getElementById('mailgun-status-badge');
        
        if (data.success) {
            badge.textContent = 'Online';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-success';
            
            container.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Entregues (24h)</span>
                        <span class="text-lg font-bold text-white">${formatNumber(data.delivered_24h || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Taxa de Entrega</span>
                        <span class="text-lg font-bold text-success">${formatPercent(data.delivery_rate || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Domínios Ativos</span>
                        <span class="text-lg font-bold text-primary">${data.active_domains || 0}</span>
                    </div>
                </div>
            `;
        } else {
            badge.textContent = 'Offline';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-danger';
            
            container.innerHTML = `
                <div class="text-sm text-gray-500">
                    <p>${data.error || 'Erro ao carregar dados'}</p>
                    <p class="text-xs mt-2">Verifique as credenciais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('[MAILGUN] Error:', error);
    }
}

// ==================== PMG ====================
async function loadPMGData() {
    try {
        const response = await fetch('/api/pmg');
        const data = await response.json();
        
        state.data.pmg = data;
        
        const container = document.getElementById('pmg-data');
        const badge = document.getElementById('pmg-status-badge');
        
        if (data.success) {
            badge.textContent = 'Online';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-success';
            
            container.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Fila Ativa</span>
                        <span class="text-lg font-bold text-white">${formatNumber(data.queue || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Spam Bloqueado</span>
                        <span class="text-lg font-bold text-warning">${formatNumber(data.spam_blocked || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Vírus Bloqueados</span>
                        <span class="text-lg font-bold text-danger">${formatNumber(data.virus_blocked || 0)}</span>
                    </div>
                </div>
            `;
        } else {
            badge.textContent = 'Offline';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-danger';
            
            container.innerHTML = `
                <div class="text-sm text-gray-500">
                    <p>${data.error || 'Erro ao carregar dados'}</p>
                    <p class="text-xs mt-2">Verifique as credenciais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('[PMG] Error:', error);
    }
}

// ==================== SERVER ====================
async function loadServerData() {
    try {
        const response = await fetch('/api/server');
        const data = await response.json();
        
        state.data.server = data;
        
        const container = document.getElementById('server-data');
        const badge = document.getElementById('server-status-badge');
        
        if (data.success) {
            badge.textContent = 'Online';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-success';
            
            const cpuClass = data.cpu > 80 ? 'text-danger' : data.cpu > 60 ? 'text-warning' : 'text-success';
            const memClass = data.memory_percent > 80 ? 'text-danger' : data.memory_percent > 60 ? 'text-warning' : 'text-success';
            const diskClass = data.disk_percent > 80 ? 'text-danger' : data.disk_percent > 60 ? 'text-warning' : 'text-success';
            
            container.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">CPU</span>
                        <span class="text-lg font-bold ${cpuClass}">${formatPercent(data.cpu || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Memória</span>
                        <span class="text-lg font-bold ${memClass}">${formatPercent(data.memory_percent || 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">Disco</span>
                        <span class="text-lg font-bold ${diskClass}">${formatPercent(data.disk_percent || 0)}</span>
                    </div>
                </div>
            `;
            
            // Update sidebar
            document.getElementById('sidebar-uptime').textContent = formatUptime(data.uptime || 0);
            document.getElementById('sidebar-cpu').textContent = formatPercent(data.cpu || 0);
        } else {
            badge.textContent = 'Offline';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-danger';
            
            container.innerHTML = `
                <div class="text-sm text-gray-500">
                    <p>${data.error || 'Erro ao carregar dados'}</p>
                    <p class="text-xs mt-2">Verifique as credenciais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('[SERVER] Error:', error);
    }
}

// ==================== CPANEL ====================
async function loadCPanelData() {
    try {
        const response = await fetch('/api/cpanel');
        const data = await response.json();
        
        state.data.cpanel = data;
        
        const container = document.getElementById('cpanel-accounts-container');
        const badge = document.getElementById('cpanel-status-badge');
        
        if (data.success && data.accounts && data.accounts.length > 0) {
            badge.textContent = `${data.accounts.length} Contas`;
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-success';
            
            container.innerHTML = data.accounts.map(account => {
                const diskPercent = account.disk_used && account.disk_limit 
                    ? (account.disk_used / account.disk_limit * 100).toFixed(1)
                    : 0;
                
                const diskClass = diskPercent > 80 ? 'danger' : diskPercent > 60 ? 'warning' : 'success';
                
                // Get domains list
                const domains = account.domains || [];
                const domainsHtml = domains.length > 0 
                    ? `<div class="domain-list-container mt-3">
                        ${domains.map(domain => `<span class="domain-tag">${domain}</span>`).join('')}
                       </div>`
                    : '<p class="text-xs text-gray-500 mt-2">Nenhum domínio configurado</p>';
                
                return `
                    <div class="bg-dark-800 border border-dark-700 rounded-lg p-4 animate-slide-in-up">
                        <div class="flex items-center justify-between mb-3">
                            <h5 class="font-semibold text-white">${account.name || 'Conta'}</h5>
                            <span class="text-xs text-gray-400">${account.email_accounts || 0} emails</span>
                        </div>
                        
                        <div class="space-y-2">
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-gray-400">Disco</span>
                                    <span class="text-gray-300">${formatBytes(account.disk_used || 0)} / ${account.disk_limit ? formatBytes(account.disk_limit) : '∞'}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-bar-fill ${diskClass}" style="width: ${Math.min(diskPercent, 100)}%"></div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-2 text-xs">
                                <div class="text-center">
                                    <div class="text-gray-400">Domínios</div>
                                    <div class="text-white font-semibold">${account.domains_count || domains.length || 0}</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">Bancos</div>
                                    <div class="text-white font-semibold">${account.databases || 0}</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-gray-400">Inodes</div>
                                    <div class="text-white font-semibold">${formatNumber(account.inodes || 0)}</div>
                                </div>
                            </div>
                        </div>
                        
                        ${domainsHtml}
                    </div>
                `;
            }).join('');
        } else {
            badge.textContent = 'Offline';
            badge.className = 'px-2 py-1 text-xs font-semibold rounded-full status-badge-danger';
            
            container.innerHTML = `
                <div class="text-sm text-gray-500 text-center py-8">
                    <p>${data.error || 'Nenhuma conta encontrada'}</p>
                    <p class="text-xs mt-2">Verifique as credenciais</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('[CPANEL] Error:', error);
    }
}

// ==================== KPIS ====================
function updateKPIs() {
    // Total Emails
    const totalEmails = (state.data.postmark?.sent_24h || 0) + (state.data.mailgun?.delivered_24h || 0);
    document.querySelector('#kpi-total-emails .text-3xl').textContent = formatNumber(totalEmails);
    
    // Open Rate
    const openRate = state.data.postmark?.open_rate || 0;
    document.querySelector('#kpi-open-rate .text-3xl').textContent = formatPercent(openRate);
    
    // Server Health (CPU)
    const cpu = state.data.server?.cpu || 0;
    document.querySelector('#kpi-server-health .text-3xl').textContent = formatPercent(cpu);
    
    // Active Services
    let activeServices = 0;
    let totalServices = 5;
    
    if (state.data.postmark?.success) activeServices++;
    if (state.data.mailgun?.success) activeServices++;
    if (state.data.pmg?.success) activeServices++;
    if (state.data.server?.success) activeServices++;
    if (state.data.cpanel?.success) activeServices++;
    
    document.querySelector('#kpi-active-services .text-3xl').textContent = `${activeServices}/${totalServices}`;
    document.getElementById('sidebar-services-count').textContent = `${activeServices}/${totalServices}`;
    
    const servicesStatus = activeServices === totalServices ? 'Todos Online' : 
                           activeServices > 0 ? 'Parcialmente Online' : 'Todos Offline';
    const servicesClass = activeServices === totalServices ? 'text-success' : 
                          activeServices > 0 ? 'text-warning' : 'text-danger';
    
    document.getElementById('kpi-services-status').textContent = servicesStatus;
    document.getElementById('kpi-services-status').className = `text-xs ${servicesClass}`;
}

// ==================== CHARTS ====================
function updateCharts() {
    createEmailMetricsChart();
    createServerResourcesChart();
    createMiniCharts();
}

function createEmailMetricsChart() {
    const canvas = document.getElementById('chart-email-metrics');
    const loading = document.getElementById('chart-email-metrics-loading');
    
    if (!canvas) return;
    
    // Hide loading, show chart
    loading?.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    // Destroy existing chart
    if (state.charts.emailMetrics) {
        state.charts.emailMetrics.destroy();
    }
    
    // Sample data (replace with real data from API)
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
    
    state.charts.emailMetrics = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Enviados',
                    data: [120, 150, 180, 220, 190, 160, 140],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Abertos',
                    data: [80, 100, 120, 150, 130, 110, 95],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Clicados',
                    data: [30, 40, 50, 60, 55, 45, 38],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

function createServerResourcesChart() {
    const canvas = document.getElementById('chart-server-resources');
    const loading = document.getElementById('chart-server-resources-loading');
    
    if (!canvas) return;
    
    // Hide loading, show chart
    loading?.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    // Destroy existing chart
    if (state.charts.serverResources) {
        state.charts.serverResources.destroy();
    }
    
    const cpu = state.data.server?.cpu || 0;
    const memory = state.data.server?.memory_percent || 0;
    const disk = state.data.server?.disk_percent || 0;
    
    state.charts.serverResources = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['CPU', 'Memória', 'Disco', 'Livre'],
            datasets: [{
                data: [cpu, memory, disk, 100 - ((cpu + memory + disk) / 3)],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#334155'
                ],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#cbd5e1',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

function createMiniCharts() {
    // Mini chart for opens
    const opensCanvas = document.getElementById('mini-chart-opens');
    if (opensCanvas) {
        new Chart(opensCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: [30, 35, 40, 38, 42, 45, 43],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    y: { display: false },
                    x: { display: false }
                }
            }
        });
    }
    
    // Mini chart for CPU
    const cpuCanvas = document.getElementById('mini-chart-cpu');
    if (cpuCanvas) {
        new Chart(cpuCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: [20, 25, 30, 28, 32, 35, 30],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    y: { display: false },
                    x: { display: false }
                }
            }
        });
    }
    
    // Mini chart for services (doughnut)
    const servicesCanvas = document.getElementById('mini-chart-services');
    if (servicesCanvas) {
        let activeServices = 0;
        let totalServices = 5;
        
        if (state.data.postmark?.success) activeServices++;
        if (state.data.mailgun?.success) activeServices++;
        if (state.data.pmg?.success) activeServices++;
        if (state.data.server?.success) activeServices++;
        if (state.data.cpanel?.success) activeServices++;
        
        new Chart(servicesCanvas, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [activeServices, totalServices - activeServices],
                    backgroundColor: ['#10b981', '#334155'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }
}

// ==================== LOGS ====================
async function loadLogs() {
    try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        
        const container = document.getElementById('logs-container');
        
        if (data.success && data.logs && data.logs.length > 0) {
            container.innerHTML = data.logs.map(log => {
                const typeClass = log.type === 'success' ? 'log-success' :
                                 log.type === 'warning' ? 'log-warning' :
                                 log.type === 'error' ? 'log-error' : 'log-info';
                
                return `
                    <div class="log-entry ${typeClass}">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="text-xs text-gray-400">${log.timestamp || new Date().toLocaleString()}</span>
                                    <span class="text-xs px-2 py-0.5 rounded ${typeClass.replace('log-', 'status-badge-')}">${log.type || 'info'}</span>
                                </div>
                                <p class="text-sm text-gray-200">${log.message || 'No message'}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum log disponível</div>';
        }
        
        // Setup search
        document.getElementById('logs-search')?.addEventListener('input', (e) => {
            filterLogs(e.target.value);
        });
        
        // Setup refresh
        document.getElementById('refresh-logs-btn')?.addEventListener('click', loadLogs);
        
    } catch (error) {
        console.error('[LOGS] Error:', error);
    }
}

function filterLogs(query) {
    const entries = document.querySelectorAll('.log-entry');
    const lowerQuery = query.toLowerCase();
    
    entries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        entry.style.display = text.includes(lowerQuery) ? 'block' : 'none';
    });
}

// ==================== HISTORY ====================
async function loadHistory() {
    const canvas = document.getElementById('chart-history');
    const loading = document.getElementById('chart-history-loading');
    
    if (!canvas) return;
    
    // Hide loading, show chart
    loading?.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    // Destroy existing chart
    if (state.charts.history) {
        state.charts.history.destroy();
    }
    
    // Sample data for 7 days
    const labels = ['7 dias atrás', '6 dias', '5 dias', '4 dias', '3 dias', '2 dias', 'Ontem', 'Hoje'];
    
    state.charts.history = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Emails Enviados',
                    data: [1200, 1350, 1180, 1420, 1390, 1560, 1640, 1580],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'Emails Abertos',
                    data: [800, 900, 850, 950, 920, 1040, 1100, 1050],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// ==================== CREDENTIALS ====================
async function loadCredentials() {
    const container = document.getElementById('credentials-container');
    
    container.innerHTML = `
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Gerenciamento de Credenciais</h3>
            <p class="text-sm text-gray-400 mb-4">Configure as credenciais dos serviços monitorados</p>
            
            <div class="space-y-4">
                <div class="text-sm text-gray-500">
                    <p>As credenciais são gerenciadas através do arquivo <code class="bg-dark-800 px-2 py-1 rounded">.env</code></p>
                    <p class="mt-2">Para alterar as credenciais, edite o arquivo e reinicie o serviço.</p>
                </div>
            </div>
        </div>
    `;
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

function formatPercent(num) {
    return num.toFixed(1) + '%';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function updateLastSyncTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('last-sync-time').textContent = timeString;
}

console.log('[INTELIMON] App.js loaded successfully');
