# InteliMon Dashboard v3.0 🚀

**Sistema de Monitoramento com Interface Moderna Tailwind + Easter Egg Digimon**

Evolução do InteliMon v2.1 com interface completamente redesenhada usando o template Tailwind Dashboard da Cruip, mantendo todas as funcionalidades originais e adicionando o easter egg interativo do InteliMon Digimon!

---

## 🎉 Novidades da v3.0

### ✨ Interface Completamente Nova
- ✅ **Design moderno** baseado no Tailwind Dashboard Template (Cruip)
- ✅ **Sidebar responsiva** com ícones e animações suaves
- ✅ **Cards modernos** com hover effects e transições
- ✅ **Tema dark profissional** otimizado para longas sessões
- ✅ **Tipografia Inter** para melhor legibilidade

### 🎮 Easter Egg: Digimon + Konami Code
- ✅ **Konami Code** (`↑↑↓↓←→←→BA`) ativa o Digivice
- ✅ **Mascote InteliMon** aparece em um Digivice animado
- ✅ **Dicas inteligentes** sobre monitoramento e boas práticas
- ✅ **Análise de sistema** em tempo real com score de saúde
- ✅ **Música do Digimon** (quando configurada)
- ✅ **Estatísticas ao vivo** (serviços ativos, uptime, emails 24h)

### 🔧 Melhorias Técnicas
- ✅ **JavaScript modular** separado em arquivos específicos
- ✅ **CSS otimizado** com animações customizadas
- ✅ **Código limpo** e bem documentado
- ✅ **Performance melhorada** com lazy loading

---

## 📊 Serviços Monitorados

O InteliMon v3.0 mantém **todos** os recursos da v2.1:

### 1. 📧 Postmark
- Métricas de 24h e 30 dias
- Taxa de abertura e cliques
- Bounces e spam complaints
- Status do servidor

### 2. 🔫 Mailgun
- API Global (todos os domínios)
- Supressões (bounces, unsubscribes, complaints)
- Métricas de entrega
- Estatísticas de 24h e 30 dias

### 3. 🛡️ Proxmox Mail Gateway (PMG)
- Fila de emails
- Spam e vírus bloqueados
- Estatísticas de entrada/saída
- Quarentena

### 4. 🖥️ Servidor Linux
- CPU, RAM, Disk usage
- Load average
- Uptime
- Partições detalhadas

### 5. ⚙️ cPanel/WHM
- Cards individuais por conta
- Uso de disco e inodes
- Contas de email
- Domínios e bancos de dados

---

## 🎮 Como Usar o Easter Egg

### Ativação do Digivice

1. Abra o dashboard
2. Digite no teclado a sequência do **Konami Code**:
   ```
   ↑ ↑ ↓ ↓ ← → ← → B A
   ```
3. O Digivice aparecerá com o mascote InteliMon!

### Funcionalidades do Digivice

**💡 Nova Dica**
- Clique para receber dicas aleatórias sobre:
  - Monitoramento de serviços
  - Boas práticas de email
  - Otimização de recursos
  - Segurança e backup
  - Performance e análise

**🔍 Analisar Sistema**
- Análise completa em tempo real
- Score de saúde (0-100)
- Lista de problemas detectados
- Alertas críticos e avisos
- Recomendações de ação

**Estatísticas em Tempo Real**
- **Serviços Ativos**: Quantos dos 5 serviços estão respondendo
- **Uptime**: Tempo de atividade do servidor
- **Emails 24h**: Total de emails enviados nas últimas 24 horas

---

## 🚀 Instalação

### Requisitos
- Python 3.11+
- pip3
- Acesso aos serviços que deseja monitorar

### Instalação Rápida

```bash
# 1. Extrair o projeto
cd /opt
unzip intelimon-dashboard-v3.zip
cd intelimon-dashboard-v3

# 2. Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar credenciais
cp .env.example .env
nano .env
# Preencha com suas credenciais

# 5. Iniciar o servidor
python app/app.py
```

Acesse: `http://localhost:5000`

### Instalação como Serviço (Systemd)

```bash
# Copiar arquivo de serviço
sudo cp intelimon.service /etc/systemd/system/

# Recarregar systemd
sudo systemctl daemon-reload

# Iniciar e habilitar
sudo systemctl start intelimon
sudo systemctl enable intelimon

# Ver status
sudo systemctl status intelimon
```

---

## ⚙️ Configuração

### Arquivo .env

Edite o arquivo `.env` com suas credenciais:

```bash
# Postmark
POSTMARK_SERVER_TOKEN=seu_token_aqui
POSTMARK_ACCOUNT_TOKEN=seu_token_aqui

# Mailgun
MAILGUN_API_KEY=sua_chave_aqui
MAILGUN_REGION=us
MAILGUN_DOMAIN=seu_dominio.com

# Proxmox Mail Gateway
PMG_HOST=seu_host_pmg
PMG_PORT=8006
PMG_USERNAME=root@pam
PMG_PASSWORD=sua_senha
PMG_NODE=pmg

# Linux Server (SSH)
SERVER_HOST=seu_servidor
SERVER_PORT=22
SERVER_USERNAME=root
SERVER_PASSWORD=sua_senha

# cPanel/WHM
WHM_HOST=https://seu_whm:2087
WHM_USERNAME=root
WHM_API_TOKEN=seu_token
```

### Adicionar Música do Digimon

Para ativar o áudio do easter egg:

1. Baixe a música "Butterfly" do Digimon Adventure (formato MP3)
2. Renomeie para: `digimon-adventure.mp3`
3. Coloque em: `app/static/audio/digimon-adventure.mp3`

**Fontes legais:**
- Comprar em plataformas digitais (iTunes, Amazon Music)
- Spotify (com download premium)
- YouTube Music (com permissão)

---

## 🌐 Acesso via Nginx (Recomendado)

### Configuração Nginx

```bash
# Instalar Nginx
sudo apt install nginx  # Ubuntu/Debian
# ou
sudo yum install nginx  # CentOS/AlmaLinux

# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/intelimon
sudo ln -s /etc/nginx/sites-available/intelimon /etc/nginx/sites-enabled/

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

**Acesse:** `http://seu-servidor`

---

## 📁 Estrutura do Projeto

```
intelimon-dashboard-v3/
├── app/
│   ├── app.py                          # Flask app principal
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css              # Estilos Tailwind + custom
│   │   ├── js/
│   │   │   ├── app.js                 # JavaScript principal
│   │   │   └── digimon-easter-egg.js  # Easter egg Konami Code
│   │   ├── audio/
│   │   │   └── digimon-adventure.mp3  # Música do Digimon
│   │   └── images/
│   │       └── intelimon-mascot.svg   # Mascote InteliMon
│   └── templates/
│       └── index.html                  # Template HTML Tailwind
├── services/
│   ├── postmark_service.py            # Integração Postmark
│   ├── mailgun_service.py             # Integração Mailgun
│   ├── pmg_service.py                 # Integração PMG
│   ├── server_monitor_service.py      # Monitoramento SSH
│   └── cpanel_service.py              # Integração cPanel/WHM
├── config/
│   └── settings.py                    # Configurações
├── requirements.txt                    # Dependências Python
├── .env                               # Variáveis de ambiente
├── .env.example                       # Exemplo de configuração
├── intelimon.service                  # Systemd service
├── nginx.conf                         # Configuração Nginx
└── README.md                          # Este arquivo
```

---

## 🎨 Personalização

### Customizar Dicas do InteliMon

Edite `app/static/js/digimon-easter-egg.js`:

```javascript
const INTELIMON_TIPS = [
    {
        message: "Sua mensagem aqui! 🔥",
        tip: "Sua dica técnica detalhada aqui..."
    },
    // Adicione quantas quiser!
];
```

### Customizar Cores

Edite `app/static/css/style.css`:

```css
/* Cores do Digivice */
.digivice-gradient {
    background: linear-gradient(135deg, #ff6b00 0%, #ff0080 50%, #ff00ff 100%);
}

/* Cores dos cards */
.card-hover:hover {
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}
```

---

## 📊 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Interface web principal |
| GET | `/api/postmark` | Dados do Postmark |
| GET | `/api/mailgun` | Dados do Mailgun |
| GET | `/api/pmg` | Dados do PMG |
| GET | `/api/server` | Métricas do servidor |
| GET | `/api/cpanel` | Dados cPanel/WHM |
| GET | `/api/overview` | Overview geral |
| GET | `/api/refresh` | Força atualização |

---

## 🐛 Troubleshooting

### Easter Egg não ativa

**Problema:** Konami Code não funciona

**Solução:**
1. Certifique-se de estar na página principal
2. Digite a sequência correta: `↑↑↓↓←→←→BA`
3. Use as setas do teclado (não numpad)
4. Pressione as teclas B e A (não juntas, uma após a outra)
5. Abra o console (F12) e procure por mensagens `[KONAMI]`

### Áudio não toca

**Problema:** Música do Digimon não reproduz

**Solução:**
1. Verifique se o arquivo existe: `app/static/audio/digimon-adventure.mp3`
2. Verifique as permissões do arquivo
3. Alguns navegadores bloqueiam autoplay - clique na página primeiro
4. Verifique o console para erros de áudio

### Serviços não carregam

**Problema:** Cards mostram "Erro ao carregar"

**Solução:**
1. Verifique as credenciais no `.env`
2. Teste conectividade com os servidores
3. Veja os logs: `journalctl -u intelimon -f`
4. Verifique firewalls e portas

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
journalctl -u intelimon -f

# Reiniciar serviço
sudo systemctl restart intelimon

# Ver status
sudo systemctl status intelimon

# Testar manualmente
cd /opt/intelimon-dashboard-v3
source venv/bin/activate
python app/app.py

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Changelog

### v3.0 (19/11/2025)

**Adicionado:**
- ✅ Interface Tailwind Dashboard moderna
- ✅ Easter egg Digimon com Konami Code
- ✅ Análise de sistema em tempo real
- ✅ Dicas inteligentes do InteliMon
- ✅ Sidebar responsiva e colapsável
- ✅ Animações e transições suaves
- ✅ JavaScript modular separado

**Melhorado:**
- ✅ Performance geral da interface
- ✅ Organização do código
- ✅ Documentação completa
- ✅ Experiência do usuário

**Mantido da v2.1:**
- ✅ Todos os serviços de monitoramento
- ✅ Backend Flask completo
- ✅ Integração com APIs
- ✅ Configuração via .env

---

## 🎯 Roadmap

### v3.1 (Próxima versão)
- [ ] Autenticação de usuários
- [ ] Histórico em banco de dados
- [ ] Gráficos interativos aprimorados
- [ ] Modo claro (light theme)

### v3.2 (Futuro)
- [ ] Alertas por email/Telegram
- [ ] App mobile
- [ ] Dashboard público (read-only)
- [ ] Relatórios em PDF

---

## 📞 Suporte

### GitHub
[https://github.com/Helbertmgdata/mgdata](https://github.com/Helbertmgdata/mgdata)

### Documentação
- `README.md` - Este arquivo
- `README_v2.1_backup.md` - Documentação da versão anterior

---

## 🎉 Conclusão

O **InteliMon Dashboard v3.0** traz uma experiência completamente nova de monitoramento, combinando:

- 🎨 **Design moderno** e profissional
- 🎮 **Easter egg divertido** e interativo
- 📊 **Monitoramento completo** de todos os serviços
- ⚡ **Performance otimizada**
- 🔧 **Código limpo** e bem documentado

**Divirta-se monitorando! E não esqueça do Konami Code! 🎮**

```
↑ ↑ ↓ ↓ ← → ← → B A
```

---

**Desenvolvido com 💚 por MGData**

**Versão:** 3.0.0  
**Data:** 19/11/2025  
**Licença:** MIT

**InteliMon** - Seu parceiro digital de monitoramento! 🔥
