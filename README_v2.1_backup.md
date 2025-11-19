# 🚀 InteliMon Dashboard v2.1

**Dashboard de Monitoramento Avançado** - Versão Flask/Python (sem Node.js!)

Interface dark/nerd/geek com tema Matrix/Cyberpunk para monitoramento completo de serviços de email e infraestrutura.

---

## ✨ Novidades da v2.1

### 🆕 Adicionado

- ✅ **Monitoramento de cPanel/WHM** - Cards individuais para cada conta
- ✅ **Configuração Nginx** - Acesso via IP interno
- ✅ **Informações expandidas** - Postmark e Mailgun com mais detalhes úteis
- ✅ **Tema nerd/geek** aplicado em toda a interface
- ✅ **Supressões do Mailgun** - Bounces, unsubscribes, complaints
- ✅ **Info do servidor Postmark** - Nome, SMTP API, webhooks
- ✅ **Inodes do cPanel** - Monitoramento completo de recursos

---

## 📊 Serviços Monitorados

### 1. 📧 Postmark

**Informações do Servidor:**
- Nome do servidor
- Status SMTP API
- Webhooks configurados

**Métricas de 24 horas:**
- Emails enviados
- Aberturas e taxa de abertura
- Cliques e taxa de cliques
- Bounces e taxa de bounce

**Métricas de 30 dias:**
- Totais acumulados
- Taxas médias
- Reclamações de spam
- Total de bounces histórico

### 2. 🔫 Mailgun (API Global)

**Visão geral da conta:**
- Total de domínios (todos os 70+!)
- Domínios ativos
- Regiões configuradas

**Métricas de 24 horas:**
- Aceitos, entregues, falhas
- Aberturas e cliques
- Taxas de entrega, abertura, clique e bounce

**Métricas de 30 dias:**
- Totais acumulados
- Reclamações
- Tendências

**Supressões:**
- Total de bounces
- Total de unsubscribes
- Total de complaints

### 3. 🛡️ Proxmox Mail Gateway (PMG)

**Estatísticas de email (hoje):**
- Emails recebidos e enviados
- Spam bloqueado (quantidade e taxa)
- Vírus bloqueados (quantidade e taxa)

**Status do sistema:**
- Uso de CPU
- Uso de memória
- Fila de emails (ativa/diferida)
- Quarentena

### 4. 🖥️ Linux Server Monitor

**Recursos do sistema:**
- **CPU**: Uso e idle percentage
- **RAM**: Total, usado, disponível, livre (MB e GB)
- **Load Average**: 1min, 5min, 15min

**Partições de disco:**
- Lista completa de todas as partições
- Filesystem, tamanho, uso
- Progress bars visuais
- Alertas coloridos (>70% amarelo, >90% vermelho)

**Informações gerais:**
- Hostname
- Sistema operacional
- Uptime

### 5. ⚙️ cPanel/WHM (NOVO!)

**Cards individuais para cada conta:**

**Disco:**
- Uso em GB
- Limite (se configurado)
- Percentual de uso
- Progress bar visual

**Recursos:**
- Banda utilizada
- Contas de email
- Domínios
- Bancos de dados

**Inodes:**
- Uso de inodes
- Limite de inodes
- Percentual
- Progress bar

---

## 🌐 Acesso via Nginx (NOVO!)

Agora você pode acessar o dashboard via IP interno usando Nginx!

### Vantagens

- ✅ Mais rápido que acesso direto ao Flask
- ✅ Cache de arquivos estáticos
- ✅ Logs separados
- ✅ Camada extra de segurança
- ✅ Acesso via porta 80 (HTTP padrão)

### Configuração Rápida

```bash
# Instalar Nginx
sudo yum install -y nginx  # AlmaLinux/CentOS
# ou
sudo apt install -y nginx  # Ubuntu/Debian

# Copiar configuração
sudo cp /opt/intelimon-flask/nginx.conf /etc/nginx/conf.d/intelimon.conf

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

**Acesse:** `http://IP-DO-SERVIDOR`

📖 **Guia completo:** Veja `NGINX_SETUP.md` para instruções detalhadas.

---

## 🛠️ Instalação

### Requisitos
- Python 3.8+
- AlmaLinux/CentOS/RHEL 8+ ou Ubuntu/Debian
- Acesso root

### Passos

```bash
# 1. Extrair
cd /opt
unzip intelimon-flask.zip
cd intelimon-flask

# 2. Instalar
chmod +x install.sh
./install.sh

# 3. Configurar
nano .env
# Preencher credenciais (veja seção abaixo)

# 4. Iniciar
systemctl start intelimon
systemctl enable intelimon

# 5. (Opcional) Configurar Nginx
# Veja NGINX_SETUP.md
```

---

## ⚙️ Configuração

Edite o arquivo `.env` com suas credenciais:

### Postmark

```bash
POSTMARK_SERVER_TOKEN=seu-token-server
POSTMARK_ACCOUNT_TOKEN=seu-token-account
```

### Mailgun (API Global)

```bash
MAILGUN_API_KEY=sua-api-key
MAILGUN_REGION=us  # ou 'eu'
```

### Proxmox Mail Gateway

```bash
PMG_HOST=192.168.99.79
PMG_PORT=8006
PMG_USERNAME=root@pam
PMG_PASSWORD=sua-senha
PMG_NODE=pmg
```

### Servidor Linux (SSH)

```bash
SERVER_HOST=mail.intelimail.com.br
SERVER_PORT=22
SERVER_USERNAME=root
SERVER_PASSWORD=sua-senha-ssh
```

### cPanel/WHM (NOVO!)

**Formato:** `nome:url:usuario:token`

Separe múltiplas contas por vírgula:

```bash
CPANEL_ACCOUNTS=mgdata:https://mail.intelimail.com.br:2087:mgdata:TOKEN1,lavras:https://mail.intelimail.com.br:2087:lavras:TOKEN2,acispes:https://mail.intelimail.com.br:2087:acispes:TOKEN3
```

**Como obter o token do cPanel:**

1. Login no WHM como root
2. Ir em: **WHM → API Tokens**
3. Criar novo token com permissões necessárias
4. Copiar o token gerado

---

## 🌐 Acesso

### Sem Nginx (direto Flask)

```
http://seu-servidor:5000
```

### Com Nginx (recomendado)

```
http://seu-servidor
```

ou

```
http://IP-INTERNO
```

Exemplo: `http://192.168.99.30`

---

## 📊 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Interface web principal |
| GET | `/api/health` | Health check |
| GET | `/api/postmark` | Dados do Postmark (expandido) |
| GET | `/api/mailgun` | Dados do Mailgun (global + supressões) |
| GET | `/api/pmg` | Dados do PMG |
| GET | `/api/server` | Dados do servidor Linux |
| GET | `/api/cpanel` | Dados de todas as contas cPanel |
| GET | `/api/cpanel/<nome>` | Dados de uma conta cPanel específica |
| GET | `/api/overview` | Overview de todos os serviços |
| GET | `/api/refresh` | Força atualização de todos os dados |
| GET | `/api/konami` | Easter egg: Konami Code |
| GET | `/api/matrix` | Easter egg: Matrix Mode |
| GET | `/api/hack` | Easter egg: Hacker Mode |

---

## 🎮 Easter Eggs

### 1. Konami Code
**Como ativar:** `↑↑↓↓←→←→BA`

**Efeito:**
- Animação rainbow em toda a página
- Mensagem especial no console
- Alert com mensagem secreta

### 2. Matrix Mode
**Como ativar:** `Ctrl + M`

**Efeito:**
- Alterna tema Matrix
- Cards com fundo preto
- Texto verde piscante

### 3. Hacker Mode
**Como ativar:** `Ctrl + H`

**Efeito:**
- Mensagens no console do navegador
- Simulação de "hacking"
- Progress bars de acesso

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
journalctl -u intelimon -f

# Reiniciar serviço
systemctl restart intelimon

# Parar serviço
systemctl stop intelimon

# Ver status
systemctl status intelimon

# Testar manualmente
cd /opt/intelimon-flask
python3 app/app.py
```

---

## 📦 Estrutura do Projeto

```
intelimon-flask/
├── app/
│   ├── app.py                      # Flask app principal
│   ├── static/
│   │   ├── css/style.css          # Tema dark/nerd/geek
│   │   └── js/app.js              # JavaScript + easter eggs
│   └── templates/
│       └── index.html             # Template HTML
├── config/
│   └── settings.py                # Configurações
├── services/
│   ├── postmark_service.py        # Integração Postmark (expandido)
│   ├── mailgun_service.py         # Integração Mailgun (global + supressões)
│   ├── pmg_service.py             # Integração PMG
│   ├── server_monitor_service.py  # Monitoramento SSH
│   └── cpanel_service.py          # Integração cPanel/WHM (NOVO!)
├── .env.example                   # Exemplo de configuração
├── requirements.txt               # Dependências Python
├── install.sh                     # Script de instalação
├── intelimon.service             # Systemd service
├── nginx.conf                     # Configuração Nginx (NOVO!)
├── README.md                      # Documentação completa
├── INSTALACAO_RAPIDA.md          # Guia rápido
├── NGINX_SETUP.md                # Guia Nginx (NOVO!)
└── CHANGELOG.md                   # Histórico de mudanças
```

---

## 🐛 Troubleshooting

### Erro: cPanel não conecta

**Solução:**
```bash
# Verificar token
# Login no WHM → API Tokens
# Verificar se o token tem permissões

# Testar conexão manual
curl -k -H "Authorization: whm root:TOKEN" \
  "https://mail.intelimail.com.br:2087/json-api/version"
```

### Erro: Nginx 502 Bad Gateway

**Solução:**
```bash
# Verificar se Flask está rodando
systemctl status intelimon

# Se não estiver, iniciar
systemctl start intelimon
```

### Erro: Mailgun não retorna supressões

**Solução:**
- Normal se não houver domínios configurados
- Verifique se a API key tem permissões de leitura
- Supressões são opcionais, não afetam o funcionamento

---

## 📝 Changelog

### v2.1 (18/11/2025)

**Adicionado:**
- ✅ Monitoramento de cPanel/WHM com cards individuais
- ✅ Configuração Nginx para acesso via IP interno
- ✅ Informações expandidas de Postmark (servidor, webhooks, bounces)
- ✅ Informações expandidas de Mailgun (supressões, domínios ativos)
- ✅ Monitoramento de inodes no cPanel
- ✅ Guia de configuração Nginx (NGINX_SETUP.md)

**Melhorado:**
- ✅ Interface mais informativa e útil
- ✅ Cards com mais detalhes relevantes
- ✅ Tema nerd/geek aplicado em toda a interface
- ✅ Progress bars coloridas para alertas visuais

### v2.0 (18/11/2025)

- 🎉 Versão inicial Flask/Python
- ✅ Sem Node.js, sem compilação
- ✅ Mailgun API global
- ✅ Monitoramento completo de servidor Linux
- ✅ Interface dark/nerd/geek
- ✅ Easter eggs interativos

---

## 🎯 Próximos Passos

### Curto Prazo (v2.2)
- Autenticação de usuários
- Histórico em banco de dados
- Gráficos interativos (Chart.js)

### Médio Prazo (v2.3)
- Alertas por email
- Alertas por Telegram
- Suporte a múltiplos servidores

---

## 📞 Suporte

### Documentação
- `README.md` - Este arquivo
- `INSTALACAO_RAPIDA.md` - Guia rápido de instalação
- `NGINX_SETUP.md` - Configuração Nginx
- `CHANGELOG.md` - Histórico de mudanças

### GitHub
[https://github.com/Helbertmgdata/mgdata](https://github.com/Helbertmgdata/mgdata)

---

## 🎉 Conclusão

O **InteliMon Dashboard v2.1** agora inclui monitoramento completo de cPanel/WHM, acesso via Nginx, e informações muito mais úteis e detalhadas de todos os serviços.

A interface dark/nerd/geek com easter eggs torna o monitoramento uma experiência profissional e divertida ao mesmo tempo.

---

**Desenvolvido com 💚 por MGData**

**Versão:** 2.1.0  
**Data:** 18/11/2025  
**Licença:** MIT

🎮 **Não esqueça de testar os easter eggs!**

```
↑↑↓↓←→←→BA
```
