// =====================================================================
//  InteliMon Digivice - Classic Easter Egg (Konami Code)
// =====================================================================

console.log('[DIGIVICE] Initializing Easter Egg...');

// ==================== KONAMI CODE DETECTOR ====================
const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

let konamiProgress = 0;
let digiviceActive = false;
let currentTipIndex = 0;

// ==================== INTELIMON TIPS ====================
const INTELIMON_TIPS = [
    {
        title: "Monitoramento Proativo! 🔍",
        message: "Sempre monitore suas métricas ANTES que os problemas aconteçam. Prevenção é melhor que correção!"
    },
    {
        title: "Taxa de Abertura Ideal! 📧",
        message: "Uma boa taxa de abertura de emails está entre 15-25%. Acima disso, você está indo muito bem!"
    },
    {
        title: "Bounce Rate Crítico! ⚠️",
        message: "Se sua taxa de bounce passar de 5%, é hora de limpar sua lista de emails!"
    },
    {
        title: "CPU sob Controle! 💻",
        message: "Mantenha o uso de CPU abaixo de 70% para garantir performance estável do servidor."
    },
    {
        title: "Memória Otimizada! 🧠",
        message: "Uso de memória acima de 80% pode causar lentidão. Considere upgrade ou otimização!"
    },
    {
        title: "Backup Regular! 💾",
        message: "Faça backup de suas configurações e dados pelo menos uma vez por semana!"
    },
    {
        title: "Segurança em Primeiro Lugar! 🛡️",
        message: "O PMG está bloqueando spam e vírus automaticamente. Mantenha-o sempre atualizado!"
    },
    {
        title: "Logs são Importantes! 📝",
        message: "Revise seus logs regularmente para identificar padrões e prevenir problemas futuros."
    },
    {
        title: "Domínios Organizados! 🌐",
        message: "Mantenha seus domínios bem organizados no cPanel para facilitar o gerenciamento."
    },
    {
        title: "Inodes no Limite! 📊",
        message: "Mesmo com espaço em disco, muitos arquivos pequenos podem esgotar os inodes!"
    },
    {
        title: "Uptime Excelente! ⏰",
        message: "Quanto maior o uptime, mais confiável é seu servidor. Busque sempre 99.9%!"
    },
    {
        title: "Fila de Emails! 📬",
        message: "Fila de emails muito grande pode indicar problemas de entrega. Investigue!"
    },
    {
        title: "Autenticação Forte! 🔐",
        message: "Use tokens de API ao invés de senhas sempre que possível para maior segurança."
    },
    {
        title: "Métricas em Tempo Real! ⚡",
        message: "Ative o auto-refresh para monitorar suas métricas em tempo real!"
    },
    {
        title: "Manutenção Preventiva! 🔧",
        message: "Agende manutenções regulares para evitar surpresas desagradáveis no futuro."
    }
];

// ==================== KONAMI CODE LISTENER ====================
document.addEventListener('keydown', (e) => {
    if (digiviceActive) return;
    
    if (e.code === KONAMI_CODE[konamiProgress]) {
        konamiProgress++;
        console.log(`[KONAMI] Progress: ${konamiProgress}/${KONAMI_CODE.length}`);
        
        if (konamiProgress === KONAMI_CODE.length) {
            console.log('[KONAMI] CODE COMPLETE! Activating Digivice...');
            activateDigivice();
            konamiProgress = 0;
        }
    } else {
        if (konamiProgress > 0) {
            console.log('[KONAMI] Reset progress');
        }
        konamiProgress = 0;
    }
});

// ==================== DIGIVICE ACTIVATION ====================
function activateDigivice() {
    if (digiviceActive) return;
    
    console.log('[DIGIVICE] Activating...');
    digiviceActive = true;
    
    // Play sound if available
    playDigiviceSound();
    
    // Create and show Digivice
    createDigivice();
    
    // Show modal
    const modal = document.getElementById('digivice-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// ==================== CREATE DIGIVICE ====================
function createDigivice() {
    const container = document.getElementById('digivice-container');
    
    const tip = INTELIMON_TIPS[currentTipIndex];
    
    container.innerHTML = `
        <div class="digivice">
            <div class="digivice-close" onclick="closeDigivice()">×</div>
            
            <div class="digivice-body">
                <!-- Screen Container -->
                <div class="digivice-screen-container">
                    <div class="digivice-screen-border"></div>
                    <div class="digivice-screen">
                        <div class="digivice-content">
                            <div>
                                <div class="digivice-text digivice-title">${tip.title}</div>
                                <div class="digivice-mascot">🔥</div>
                                <div class="digivice-text digivice-message">${tip.message}</div>
                            </div>
                            
                            <div class="digivice-stats">
                                <div class="digivice-stat">
                                    <span class="digivice-stat-label digivice-text">SERVIÇOS</span>
                                    <span class="digivice-stat-value digivice-text" id="digivice-services">-</span>
                                </div>
                                <div class="digivice-stat">
                                    <span class="digivice-stat-label digivice-text">UPTIME</span>
                                    <span class="digivice-stat-value digivice-text" id="digivice-uptime">--</span>
                                </div>
                                <div class="digivice-stat">
                                    <span class="digivice-stat-label digivice-text">EMAILS 24H</span>
                                    <span class="digivice-stat-value digivice-text" id="digivice-emails">0</span>
                                </div>
                                <div class="digivice-stat">
                                    <span class="digivice-stat-label digivice-text">CPU</span>
                                    <span class="digivice-stat-value digivice-text" id="digivice-cpu">--%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Buttons -->
                <div class="digivice-buttons">
                    <button class="digivice-btn digivice-btn-left" onclick="showNewTip()">
                        <div class="digivice-btn-label">💡 Nova Dica</div>
                    </button>
                    <button class="digivice-btn digivice-btn-center" onclick="analyzeSystem()">
                        <div class="digivice-btn-label">🔍 Analisar</div>
                    </button>
                    <button class="digivice-btn digivice-btn-right" onclick="closeDigivice()">
                        <div class="digivice-btn-label">❌ Fechar</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Update stats
    updateDigiviceStats();
}

// ==================== UPDATE DIGIVICE STATS ====================
function updateDigiviceStats() {
    // Get data from main state
    const data = window.state?.data || {};
    
    // Services count
    let activeServices = 0;
    let totalServices = 5;
    
    if (data.postmark?.success) activeServices++;
    if (data.mailgun?.success) activeServices++;
    if (data.pmg?.success) activeServices++;
    if (data.server?.success) activeServices++;
    if (data.cpanel?.success) activeServices++;
    
    document.getElementById('digivice-services').textContent = `${activeServices}/${totalServices}`;
    
    // Uptime
    const uptime = data.server?.uptime || 0;
    document.getElementById('digivice-uptime').textContent = formatUptimeShort(uptime);
    
    // Emails 24h
    const totalEmails = (data.postmark?.sent_24h || 0) + (data.mailgun?.delivered_24h || 0);
    document.getElementById('digivice-emails').textContent = totalEmails;
    
    // CPU
    const cpu = data.server?.cpu || 0;
    document.getElementById('digivice-cpu').textContent = cpu.toFixed(1) + '%';
}

// ==================== SHOW NEW TIP ====================
function showNewTip() {
    console.log('[DIGIVICE] Showing new tip...');
    
    // Get next tip
    currentTipIndex = (currentTipIndex + 1) % INTELIMON_TIPS.length;
    const tip = INTELIMON_TIPS[currentTipIndex];
    
    // Update screen content
    const screen = document.querySelector('.digivice-content');
    if (screen) {
        screen.querySelector('.digivice-title').textContent = tip.title;
        screen.querySelector('.digivice-message').textContent = tip.message;
        
        // Add animation
        screen.style.animation = 'none';
        setTimeout(() => {
            screen.style.animation = 'fadeIn 0.3s ease-in-out';
        }, 10);
    }
    
    // Update stats
    updateDigiviceStats();
}

// ==================== ANALYZE SYSTEM ====================
function analyzeSystem() {
    console.log('[DIGIVICE] Analyzing system...');
    
    const data = window.state?.data || {};
    
    // Calculate health score
    let healthScore = 100;
    let problems = [];
    
    // Check services
    if (!data.postmark?.success) {
        healthScore -= 15;
        problems.push('❌ Postmark offline');
    }
    if (!data.mailgun?.success) {
        healthScore -= 15;
        problems.push('❌ Mailgun offline');
    }
    if (!data.pmg?.success) {
        healthScore -= 15;
        problems.push('❌ PMG offline');
    }
    if (!data.server?.success) {
        healthScore -= 20;
        problems.push('❌ Servidor offline');
    }
    if (!data.cpanel?.success) {
        healthScore -= 10;
        problems.push('❌ cPanel offline');
    }
    
    // Check server resources
    if (data.server?.cpu > 80) {
        healthScore -= 10;
        problems.push('⚠️ CPU crítica: ' + data.server.cpu.toFixed(1) + '%');
    } else if (data.server?.cpu > 60) {
        healthScore -= 5;
        problems.push('⚠️ CPU alta: ' + data.server.cpu.toFixed(1) + '%');
    }
    
    if (data.server?.memory_percent > 80) {
        healthScore -= 10;
        problems.push('⚠️ Memória crítica: ' + data.server.memory_percent.toFixed(1) + '%');
    } else if (data.server?.memory_percent > 60) {
        healthScore -= 5;
        problems.push('⚠️ Memória alta: ' + data.server.memory_percent.toFixed(1) + '%');
    }
    
    if (data.server?.disk_percent > 80) {
        healthScore -= 10;
        problems.push('⚠️ Disco crítico: ' + data.server.disk_percent.toFixed(1) + '%');
    } else if (data.server?.disk_percent > 60) {
        healthScore -= 5;
        problems.push('⚠️ Disco alto: ' + data.server.disk_percent.toFixed(1) + '%');
    }
    
    // Check email metrics
    if (data.postmark?.bounce_rate > 5) {
        healthScore -= 5;
        problems.push('⚠️ Taxa de bounce alta: ' + data.postmark.bounce_rate.toFixed(1) + '%');
    }
    
    // Ensure score doesn't go below 0
    healthScore = Math.max(0, healthScore);
    
    // Determine health class
    let healthClass = 'health-score-excellent';
    let healthMessage = 'Sistema Perfeito! 🎉';
    
    if (healthScore < 30) {
        healthClass = 'health-score-critical';
        healthMessage = 'URGENTE! Múltiplos problemas! 🆘';
    } else if (healthScore < 60) {
        healthClass = 'health-score-warning';
        healthMessage = 'Atenção! Problemas detectados! ⚠️';
    } else if (healthScore < 90) {
        healthClass = 'health-score-good';
        healthMessage = 'Sistema OK, mas pode melhorar! 👍';
    }
    
    // Update screen with analysis
    const screen = document.querySelector('.digivice-content');
    if (screen) {
        screen.innerHTML = `
            <div>
                <div class="digivice-text digivice-title">${healthMessage}</div>
                <div class="digivice-health-score ${healthClass} digivice-text">${healthScore}/100</div>
                
                ${problems.length > 0 ? `
                    <div class="digivice-problems">
                        ${problems.map(p => `<div class="digivice-problem digivice-text">${p}</div>`).join('')}
                    </div>
                ` : '<div class="digivice-text digivice-message">Tudo funcionando perfeitamente!</div>'}
            </div>
            
            <div class="digivice-stats">
                <div class="digivice-stat">
                    <span class="digivice-stat-label digivice-text">SERVIÇOS</span>
                    <span class="digivice-stat-value digivice-text" id="digivice-services">-</span>
                </div>
                <div class="digivice-stat">
                    <span class="digivice-stat-label digivice-text">UPTIME</span>
                    <span class="digivice-stat-value digivice-text" id="digivice-uptime">--</span>
                </div>
                <div class="digivice-stat">
                    <span class="digivice-stat-label digivice-text">EMAILS 24H</span>
                    <span class="digivice-stat-value digivice-text" id="digivice-emails">0</span>
                </div>
                <div class="digivice-stat">
                    <span class="digivice-stat-label digivice-text">CPU</span>
                    <span class="digivice-stat-value digivice-text" id="digivice-cpu">--%</span>
                </div>
            </div>
        `;
        
        // Add pulse animation to screen
        const screenElement = document.querySelector('.digivice-screen');
        if (screenElement) {
            screenElement.classList.add('digivice-analysis');
            setTimeout(() => {
                screenElement.classList.remove('digivice-analysis');
            }, 2000);
        }
    }
    
    // Update stats
    updateDigiviceStats();
}

// ==================== CLOSE DIGIVICE ====================
function closeDigivice() {
    console.log('[DIGIVICE] Closing...');
    
    const modal = document.getElementById('digivice-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    digiviceActive = false;
    konamiProgress = 0;
}

// ==================== PLAY SOUND ====================
function playDigiviceSound() {
    try {
        const audio = new Audio('/static/audio/digimon-adventure.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => {
            console.log('[DIGIVICE] Audio playback failed (user interaction required):', err.message);
        });
    } catch (error) {
        console.log('[DIGIVICE] Audio not available:', error.message);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function formatUptimeShort(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
}

// ==================== GLOBAL FUNCTIONS ====================
// Make functions available globally for onclick handlers
window.showNewTip = showNewTip;
window.analyzeSystem = analyzeSystem;
window.closeDigivice = closeDigivice;

console.log('[DIGIVICE] Easter Egg initialized. Type Konami Code: ↑↑↓↓←→←→BA');
