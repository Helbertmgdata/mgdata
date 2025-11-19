# 📝 Changelog - InteliMon Dashboard

## [2.0.0] - 2025-11-18

### 🎉 Versão Completa Reescrita em Flask/Python

#### ✨ Novidades

- **Reescrita completa** usando Flask e Python puro (sem Node.js)
- **Sem compilação** - Deploy instantâneo
- **Interface dark/nerd/geek** com tema Matrix/Cyberpunk
- **Easter eggs** interativos (Konami Code, Matrix Mode, Hacker Mode)
- **Mailgun API Global** - Monitora TODOS os domínios automaticamente (não precisa cadastrar 70+ domínios)
- **Monitoramento de servidor Linux** via SSH com:
  - CPU e Load Average
  - Memória RAM detalhada
  - **Todas as partições de disco**
  - Uptime e informações do sistema

#### 📧 Postmark

- Overview de **24 horas** e **30 dias**
- Emails enviados, aberturas, cliques
- Taxa de bounce e spam
- Estatísticas detalhadas em cards visuais

#### 🔫 Mailgun

- **API Global** (account-level) - sem necessidade de configurar domínios individuais
- Agregação automática de todos os domínios
- Estatísticas de **24h** e **30 dias**
- Métricas: aceitos, entregues, falhas, aberturas, cliques
- Taxa de entrega, abertura, clique e bounce

#### 🛡️ Proxmox Mail Gateway (PMG)

- Estatísticas de emails (recebidos/enviados)
- Spam e vírus bloqueados com taxas
- Uso de CPU e memória do PMG
- Status da fila de emails (ativa/diferida)
- Informações de quarentena

#### 🖥️ Linux Server Monitor

- Conexão via SSH (root)
- CPU usage e idle percentage
- Memória RAM (total, usado, disponível, livre)
- **Todas as partições de disco** com:
  - Filesystem
  - Tamanho total
  - Espaço usado
  - Espaço disponível
  - Percentual de uso
  - Ponto de montagem
- Load average (1min, 5min, 15min)
- Uptime do sistema
- Informações do SO

#### 🎨 Interface

- Tema dark com cores Matrix/Cyberpunk
- Animações e efeitos visuais
- Progress bars coloridas (verde/amarelo/vermelho)
- Cards responsivos
- Auto-refresh a cada 5 minutos
- Scrollbar customizada
- Efeitos hover e transições suaves

#### 🎮 Easter Eggs

1. **Konami Code** (`↑↑↓↓←→←→BA`)
   - Ativa modo rainbow
   - Mensagem especial no console
   - Alert com mensagem secreta

2. **Matrix Mode** (`Ctrl + M`)
   - Alterna tema Matrix
   - Cards com fundo preto
   - Texto verde piscante
   - Efeito de terminal

3. **Hacker Mode** (`Ctrl + H`)
   - Mensagens no console
   - Simulação de "hacking"
   - Progress bars de acesso
   - Mensagem final engraçada

#### 🛠️ Melhorias Técnicas

- **Sem dependências Node.js** - Apenas Python
- **Instalação simplificada** - Script automático
- **Systemd service** - Gerenciamento nativo do Linux
- **Gunicorn** para produção
- **Cache em memória** para performance
- **Tratamento de erros** robusto
- **Logs detalhados** para debug
- **CORS habilitado** para APIs

#### 📦 Estrutura

```
intelimon-flask/
├── app/
│   ├── app.py              # Flask app principal
│   ├── static/
│   │   ├── css/style.css   # Tema dark/nerd/geek
│   │   └── js/app.js       # JavaScript + easter eggs
│   └── templates/
│       └── index.html      # Template HTML
├── config/
│   └── settings.py         # Configurações
├── services/
│   ├── postmark_service.py
│   ├── mailgun_service.py
│   ├── pmg_service.py
│   └── server_monitor_service.py
├── .env.example            # Exemplo de configuração
├── requirements.txt        # Dependências Python
├── install.sh             # Script de instalação
├── intelimon.service      # Systemd service
├── README.md              # Documentação completa
├── INSTALACAO_RAPIDA.md   # Guia rápido
└── CHANGELOG.md           # Este arquivo
```

#### 🚀 Vantagens sobre v1.x (Node.js)

| Aspecto | v1.x (Node.js) | v2.0 (Flask) |
|---------|----------------|--------------|
| Compilação | Necessária | ❌ Não precisa |
| Build time | ~30-60s | Instantâneo |
| Tamanho | ~500 MB | ~50 MB |
| Inicialização | ~5-10s | <1s |
| Mailgun | Por domínio | Global (todos) |
| Monitoramento servidor | Básico | Completo (todas partições) |
| Interface | Padrão | Dark/Nerd/Geek |
| Easter eggs | ❌ | ✅ 3 modos |
| Manutenção | Complexa | Simples |

#### 📋 Requisitos

- Python 3.8+
- pip3
- AlmaLinux/CentOS/RHEL 8+ ou Ubuntu/Debian
- Acesso root (para instalação)

#### 🔧 Instalação

```bash
# Extrair
unzip intelimon-flask.zip
cd intelimon-flask

# Instalar
./install.sh

# Configurar
nano .env

# Iniciar
systemctl start intelimon
systemctl enable intelimon
```

#### 🌐 Acesso

```
http://seu-servidor:5000
```

#### 📊 APIs Disponíveis

- `GET /` - Interface web
- `GET /api/health` - Health check
- `GET /api/postmark` - Dados Postmark
- `GET /api/mailgun` - Dados Mailgun (global)
- `GET /api/pmg` - Dados PMG
- `GET /api/server` - Dados servidor Linux
- `GET /api/overview` - Overview geral
- `GET /api/refresh` - Força atualização
- `GET /api/konami` - Easter egg
- `GET /api/matrix` - Easter egg
- `GET /api/hack` - Easter egg

---

## [1.x] - Versão Node.js (Anterior)

### Características

- Desenvolvido em Node.js + TypeScript
- React frontend
- Necessitava compilação
- Monitoramento básico
- Interface padrão

### Limitações

- Compilação obrigatória
- Grande tamanho (~500 MB)
- Mailgun por domínio (precisava cadastrar todos)
- Monitoramento limitado do servidor
- Sem easter eggs

---

## 🎯 Roadmap Futuro

### v2.1 (Planejado)

- [ ] Autenticação de usuários
- [ ] Histórico em banco de dados (SQLite/PostgreSQL)
- [ ] Gráficos interativos (Chart.js/Plotly)
- [ ] Exportar relatórios em PDF
- [ ] Alertas por email
- [ ] Alertas por Telegram

### v2.2 (Planejado)

- [ ] Suporte a múltiplos servidores
- [ ] Dashboard customizável
- [ ] Temas adicionais
- [ ] API REST completa
- [ ] Webhooks

### v3.0 (Futuro)

- [ ] Machine Learning para previsão
- [ ] Alertas inteligentes
- [ ] Integração com Grafana
- [ ] Mobile app
- [ ] Cluster support

---

## 📝 Notas de Migração

### De v1.x (Node.js) para v2.0 (Flask)

1. **Backup dos dados** (se houver banco de dados)
2. **Anotar credenciais** do arquivo `.env` antigo
3. **Parar serviço antigo**: `pm2 stop intelimon-dashboard`
4. **Instalar v2.0** seguindo `INSTALACAO_RAPIDA.md`
5. **Configurar credenciais** no novo `.env`
6. **Iniciar novo serviço**: `systemctl start intelimon`

**Importante**: As configurações de Mailgun mudaram! Agora usa API global, não precisa mais cadastrar domínios individuais.

---

## 🐛 Bugs Corrigidos

### v2.0.0

- ✅ Mailgun não precisava mais de 70+ configurações de domínios
- ✅ Monitoramento de servidor agora mostra TODAS as partições
- ✅ Interface muito mais rápida e leve
- ✅ Sem necessidade de compilação
- ✅ Tratamento de erros melhorado

---

## 🙏 Agradecimentos

Obrigado a todos que usaram a v1.x e deram feedback!

A v2.0 foi completamente reescrita baseada nas sugestões de vocês.

---

**Desenvolvido com 💚 por MGData**

GitHub: [Helbertmgdata/mgdata](https://github.com/Helbertmgdata/mgdata)
