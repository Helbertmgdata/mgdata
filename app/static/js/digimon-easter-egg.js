// =====================================================================
//  InteliMon Digimon Easter Egg - Konami Code Activation
// =====================================================================

// Konami Code Sequence: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

let konamiIndex = 0;
let digimonAudio = null;
let digimonTips = [];
let currentEnvironmentData = {};

// Dicas do InteliMon sobre o ambiente
const INTELIMON_TIPS = [
    {
        message: "Olá, parceiro! Eu sou o InteliMon! 🔥",
        tip: "Estou aqui para te ajudar a monitorar seus serviços de email e infraestrutura!"
    },
    {
        message: "Dica de Monitoramento! 📊",
        tip: "Verifique regularmente a taxa de bounce dos seus emails. Uma taxa acima de 5% pode indicar problemas com sua lista de contatos."
    },
    {
        message: "Segurança em Primeiro Lugar! 🛡️",
        tip: "O PMG está bloqueando spam e vírus automaticamente. Mantenha-o sempre atualizado para máxima proteção!"
    },
    {
        message: "Otimização de Recursos! ⚡",
        tip: "Se o uso de CPU ou memória estiver constantemente acima de 80%, considere fazer um upgrade do servidor."
    },
    {
        message: "Gestão de Contas! 👥",
        tip: "Monitore o uso de disco das contas cPanel. Contas próximas do limite podem causar falhas no envio de emails."
    },
    {
        message: "Performance de Email! 📧",
        tip: "Uma boa taxa de abertura está entre 15-25%. Se estiver abaixo disso, revise seus assuntos e horários de envio."
    },
    {
        message: "Manutenção Preventiva! 🔧",
        tip: "Limpe regularmente a fila do PMG e verifique logs de erro para identificar problemas antes que afetem seus usuários."
    },
    {
        message: "Backup é Essencial! 💾",
        tip: "Certifique-se de ter backups automáticos configurados para todas as contas cPanel. A prevenção é sempre melhor!"
    },
    {
        message: "Monitoramento Proativo! 🎯",
        tip: "Configure alertas para quando métricas críticas ultrapassarem limites. Não espere os problemas acontecerem!"
    },
    {
        message: "Qualidade dos Dados! ✨",
        tip: "Mantenha suas listas de email limpas. Remova bounces permanentes e contatos inativos regularmente."
    },
    {
        message: "Reputação de IP! 🌐",
        tip: "Monitore a reputação do seu IP de envio. Um IP com má reputação pode fazer seus emails irem direto para spam."
    },
    {
        message: "Autenticação de Email! 🔐",
        tip: "Certifique-se de ter SPF, DKIM e DMARC configurados corretamente para todos os domínios de envio."
    },
    {
        message: "Análise de Tendências! 📈",
        tip: "Compare as métricas de hoje com as da semana passada. Identificar tendências ajuda a prever problemas."
    },
    {
        message: "Gestão de Quarentena! 🗂️",
        tip: "Revise a quarentena do PMG periodicamente. Às vezes emails legítimos podem ser retidos por engano."
    },
    {
        message: "Capacidade de Envio! 🚀",
        tip: "Conheça os limites de envio dos seus provedores (Postmark, Mailgun) e planeje suas campanhas de acordo."
    }
];

// Mensagens de análise do sistema
const ANALYSIS_MESSAGES = {
    excellent: [
        "Sistema operando perfeitamente! Todos os indicadores estão no verde! 🟢",
        "Excelente trabalho, parceiro! O ambiente está otimizado e saudável! 💚",
        "Tudo funcionando como deveria! Continue assim! ⭐"
    ],
    good: [
        "Sistema está bem, mas há espaço para melhorias. Fique atento! 🟡",
        "Boa performance geral! Alguns pontos merecem atenção. 👀",
        "Está indo bem! Vamos manter esse nível! 💪"
    ],
    warning: [
        "Atenção! Detectei alguns problemas que precisam de atenção. 🟠",
        "Cuidado, parceiro! Alguns serviços estão com performance abaixo do ideal. ⚠️",
        "Hora de agir! Identifiquei pontos críticos que precisam de correção. 🔴"
    ],
    critical: [
        "ALERTA CRÍTICO! O sistema precisa de atenção imediata! 🚨",
        "Situação crítica detectada! Aja rapidamente para evitar problemas maiores! ⛔",
        "URGENTE! Múltiplos serviços com problemas sérios! 🆘"
    ]
};

// Initialize Konami Code listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DIGIMON] Easter Egg inicializado. Digite o Konami Code: ↑↑↓↓←→←→BA');
    
    // Konami Code detection
    document.addEventListener('keydown', handleKonamiCode);
    
    // Initialize audio
    digimonAudio = document.getElementById('digimon-audio');
    
    // Setup sidebar toggle
    setupSidebarControls();
});

function handleKonamiCode(event) {
    const key = event.code;
    
    if (key === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        console.log(`[KONAMI] Progress: ${konamiIndex}/${KONAMI_CODE.length}`);
        
        if (konamiIndex === KONAMI_CODE.length) {
            console.log('[KONAMI] CODE ACTIVATED! 🎮');
            activateDigivice();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
}

function activateDigivice() {
    console.log('[DIGIMON] Activating Digivice...');
    
    // Play Digimon theme
    if (digimonAudio) {
        digimonAudio.currentTime = 0;
        digimonAudio.play().catch(err => {
            console.warn('[DIGIMON] Audio playback failed:', err);
        });
    }
    
    // Show modal
    const modal = document.getElementById('digivice-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    
    // Load initial tip
    showRandomTip();
    
    // Update stats
    updateDigimonStats();
    
    // Add body animation
    document.body.classList.add('konami-active');
    setTimeout(() => {
        document.body.classList.remove('konami-active');
    }, 3000);
}

function closeDigivice() {
    const modal = document.getElementById('digivice-modal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
    
    // Stop audio
    if (digimonAudio) {
        digimonAudio.pause();
        digimonAudio.currentTime = 0;
    }
}

function showRandomTip() {
    const tip = INTELIMON_TIPS[Math.floor(Math.random() * INTELIMON_TIPS.length)];
    
    const messageEl = document.getElementById('digimon-message');
    const tipEl = document.getElementById('digimon-tip');
    
    if (messageEl) messageEl.textContent = tip.message;
    if (tipEl) tipEl.textContent = tip.tip;
}

function getNewTip() {
    showRandomTip();
    
    // Add animation
    const messageEl = document.getElementById('digimon-message');
    const tipEl = document.getElementById('digimon-tip');
    
    [messageEl, tipEl].forEach(el => {
        if (el) {
            el.style.animation = 'none';
            setTimeout(() => {
                el.style.animation = 'fadeIn 0.5s ease-in-out';
            }, 10);
        }
    });
}

async function analyzeEnvironment() {
    const messageEl = document.getElementById('digimon-message');
    const tipEl = document.getElementById('digimon-tip');
    
    if (messageEl) messageEl.textContent = "Analisando o ambiente... 🔍";
    if (tipEl) tipEl.textContent = "Aguarde enquanto verifico todos os serviços...";
    
    // Fetch current data
    try {
        const [postmark, mailgun, pmg, server, cpanel] = await Promise.all([
            fetch('/api/postmark').then(r => r.json()).catch(() => ({ status: 'error' })),
            fetch('/api/mailgun').then(r => r.json()).catch(() => ({ status: 'error' })),
            fetch('/api/pmg').then(r => r.json()).catch(() => ({ status: 'error' })),
            fetch('/api/server').then(r => r.json()).catch(() => ({ status: 'error' })),
            fetch('/api/cpanel').then(r => r.json()).catch(() => ({ status: 'error' }))
        ]);
        
        currentEnvironmentData = { postmark, mailgun, pmg, server, cpanel };
        
        // Analyze health
        const analysis = analyzeSystemHealth(currentEnvironmentData);
        
        // Update UI with analysis
        if (messageEl) messageEl.textContent = analysis.message;
        if (tipEl) tipEl.innerHTML = analysis.details;
        
        // Update stats
        updateDigimonStats();
        
    } catch (error) {
        console.error('[DIGIMON] Analysis error:', error);
        if (messageEl) messageEl.textContent = "Erro ao analisar o ambiente! ❌";
        if (tipEl) tipEl.textContent = "Não foi possível conectar aos serviços. Verifique a conexão.";
    }
}

function analyzeSystemHealth(data) {
    const issues = [];
    let healthScore = 100;
    let activeServices = 0;
    
    // Check Postmark
    if (data.postmark && data.postmark.status === 'success') {
        activeServices++;
        const bounceRate = data.postmark['24h']?.bounced || 0;
        const sent = data.postmark['24h']?.sent || 1;
        const bouncePercent = (bounceRate / sent) * 100;
        
        if (bouncePercent > 5) {
            issues.push(`⚠️ Taxa de bounce do Postmark alta: ${bouncePercent.toFixed(1)}%`);
            healthScore -= 15;
        }
    } else {
        issues.push('❌ Postmark não está respondendo');
        healthScore -= 20;
    }
    
    // Check Mailgun
    if (data.mailgun && data.mailgun.status === 'success') {
        activeServices++;
    } else {
        issues.push('❌ Mailgun não está respondendo');
        healthScore -= 20;
    }
    
    // Check PMG
    if (data.pmg && data.pmg.status === 'success') {
        activeServices++;
        const queueCount = data.pmg.queue?.count || 0;
        
        if (queueCount > 100) {
            issues.push(`⚠️ Fila do PMG alta: ${queueCount} emails`);
            healthScore -= 10;
        }
    } else {
        issues.push('❌ PMG não está respondendo');
        healthScore -= 20;
    }
    
    // Check Server
    if (data.server && data.server.status === 'success') {
        activeServices++;
        const cpuUsage = data.server.cpu?.usage || 0;
        const memUsage = data.server.memory?.percent || 0;
        const diskUsage = data.server.disk?.percent || 0;
        
        if (cpuUsage > 90) {
            issues.push(`🔥 CPU crítica: ${cpuUsage}%`);
            healthScore -= 15;
        } else if (cpuUsage > 80) {
            issues.push(`⚠️ CPU alta: ${cpuUsage}%`);
            healthScore -= 10;
        }
        
        if (memUsage > 90) {
            issues.push(`🔥 Memória crítica: ${memUsage}%`);
            healthScore -= 15;
        } else if (memUsage > 80) {
            issues.push(`⚠️ Memória alta: ${memUsage}%`);
            healthScore -= 10;
        }
        
        if (diskUsage > 90) {
            issues.push(`🔥 Disco crítico: ${diskUsage}%`);
            healthScore -= 15;
        } else if (diskUsage > 80) {
            issues.push(`⚠️ Disco alto: ${diskUsage}%`);
            healthScore -= 10;
        }
    } else {
        issues.push('❌ Servidor não está respondendo');
        healthScore -= 20;
    }
    
    // Check cPanel
    if (data.cpanel && data.cpanel.status === 'success') {
        activeServices++;
    } else {
        issues.push('❌ cPanel/WHM não está respondendo');
        healthScore -= 15;
    }
    
    // Determine health level
    let level, messages;
    if (healthScore >= 90) {
        level = 'excellent';
        messages = ANALYSIS_MESSAGES.excellent;
    } else if (healthScore >= 70) {
        level = 'good';
        messages = ANALYSIS_MESSAGES.good;
    } else if (healthScore >= 50) {
        level = 'warning';
        messages = ANALYSIS_MESSAGES.warning;
    } else {
        level = 'critical';
        messages = ANALYSIS_MESSAGES.critical;
    }
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    let details = `<strong>Score de Saúde: ${healthScore}/100</strong><br><br>`;
    
    if (issues.length === 0) {
        details += '✅ Nenhum problema detectado!<br>';
        details += '✅ Todos os serviços operando normalmente<br>';
        details += '✅ Recursos do sistema em níveis saudáveis';
    } else {
        details += '<strong>Problemas Detectados:</strong><br>';
        details += issues.map(issue => `${issue}<br>`).join('');
    }
    
    return { message, details, healthScore, level, activeServices };
}

function updateDigimonStats() {
    // Count active services
    let activeServices = 0;
    const services = ['postmark', 'mailgun', 'pmg', 'server', 'cpanel'];
    
    services.forEach(service => {
        if (currentEnvironmentData[service] && currentEnvironmentData[service].status === 'success') {
            activeServices++;
        }
    });
    
    // Get uptime
    let uptime = '--';
    if (currentEnvironmentData.server && currentEnvironmentData.server.uptime) {
        uptime = currentEnvironmentData.server.uptime;
    }
    
    // Get total emails 24h
    let totalEmails = 0;
    if (currentEnvironmentData.postmark && currentEnvironmentData.postmark['24h']) {
        totalEmails += currentEnvironmentData.postmark['24h'].sent || 0;
    }
    if (currentEnvironmentData.mailgun && currentEnvironmentData.mailgun['24h']) {
        totalEmails += Number(currentEnvironmentData.mailgun['24h'].delivered || 0);
    }
    
    // Update UI
    const servicesEl = document.getElementById('stat-services');
    const uptimeEl = document.getElementById('stat-uptime');
    const emailsEl = document.getElementById('stat-emails');
    
    if (servicesEl) servicesEl.textContent = `${activeServices}/${services.length}`;
    if (uptimeEl) uptimeEl.textContent = uptime;
    if (emailsEl) emailsEl.textContent = totalEmails.toLocaleString('pt-BR');
}

function setupSidebarControls() {
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarExpand = document.getElementById('sidebar-expand');
    
    // Mobile toggle
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-64');
            sidebar.classList.toggle('translate-x-0');
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-64');
            sidebar.classList.remove('translate-x-0');
        });
    }
    
    // Desktop expand/collapse
    if (sidebarExpand) {
        sidebarExpand.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-expanded');
            localStorage.setItem('sidebar-expanded', document.body.classList.contains('sidebar-expanded'));
        });
    }
    
    // Restore sidebar state
    const sidebarExpanded = localStorage.getItem('sidebar-expanded');
    if (sidebarExpanded === 'true') {
        document.body.classList.add('sidebar-expanded');
    }
}

// Export functions to global scope
window.closeDigivice = closeDigivice;
window.getNewTip = getNewTip;
window.analyzeEnvironment = analyzeEnvironment;

console.log('[DIGIMON] Easter Egg loaded! Try the Konami Code: ↑↑↓↓←→←→BA');
