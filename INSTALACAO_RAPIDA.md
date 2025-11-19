# 🚀 Instalação Rápida - InteliMon Dashboard v2.0

## 📋 Pré-requisitos

- AlmaLinux/CentOS/RHEL 8+ ou Ubuntu/Debian
- Python 3.8+
- Acesso root

---

## ⚡ Instalação em 3 Passos

### 1️⃣ Extrair e Instalar

```bash
# Fazer upload do arquivo ZIP para o servidor
# Exemplo: usando scp
scp intelimon-flask.zip root@seu-servidor:/opt/

# Conectar no servidor
ssh root@seu-servidor

# Extrair
cd /opt
unzip intelimon-flask.zip
cd intelimon-flask

# Executar instalação automática
chmod +x install.sh
./install.sh
```

### 2️⃣ Configurar Credenciais

```bash
# Editar arquivo .env
nano .env
```

**Preencha as credenciais:**

```bash
# Postmark
POSTMARK_SERVER_TOKEN=seu-token-aqui
POSTMARK_ACCOUNT_TOKEN=seu-account-token-aqui

# Mailgun (API Global - não precisa configurar domínios!)
MAILGUN_API_KEY=sua-api-key-aqui
MAILGUN_REGION=us

# Proxmox Mail Gateway
PMG_HOST=192.168.99.79
PMG_USERNAME=root@pam
PMG_PASSWORD=sua-senha-aqui

# Servidor Linux (SSH)
SERVER_HOST=mail.intelimail.com.br
SERVER_USERNAME=root
SERVER_PASSWORD=sua-senha-ssh-aqui
```

Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3️⃣ Iniciar Serviço

```bash
# Iniciar
systemctl start intelimon

# Habilitar para iniciar com o sistema
systemctl enable intelimon

# Verificar status
systemctl status intelimon
```

---

## 🌐 Acessar Dashboard

Abra no navegador:

```
http://seu-servidor:5000
```

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
```

---

## 🎮 Easter Eggs

Depois de acessar o dashboard, teste:

- **Konami Code**: `↑↑↓↓←→←→BA`
- **Matrix Mode**: `Ctrl + M`
- **Hacker Mode**: `Ctrl + H` (veja o console do navegador)

---

## 🔥 Configurar Nginx (Opcional)

Para usar um domínio em vez de IP:porta:

```bash
# Instalar Nginx
yum install -y nginx  # AlmaLinux/CentOS
# ou
apt install -y nginx  # Ubuntu/Debian

# Criar configuração
nano /etc/nginx/conf.d/intelimon.conf
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name monitor.seudominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Habilitar Nginx
systemctl enable nginx
```

Acesse: `http://monitor.seudominio.com.br`

---

## 🔐 Firewall

```bash
# Permitir porta 5000
firewall-cmd --permanent --add-port=5000/tcp
firewall-cmd --reload

# Ou se usar Nginx (porta 80)
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
```

---

## ❓ Problemas Comuns

### Erro: "Connection refused"

```bash
# Verificar se o serviço está rodando
systemctl status intelimon

# Ver logs
journalctl -u intelimon -n 50
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
cd /opt/intelimon-flask
pip3 install -r requirements.txt
systemctl restart intelimon
```

### Erro SSH: "Permission denied"

- Verificar se a senha está correta no `.env`
- Verificar se o SSH está habilitado no servidor alvo
- Testar conexão manual: `ssh root@servidor-alvo`

### Erro PMG: "SSL verification failed"

- Normal! O código já desabilita verificação SSL para redes internas
- Certifique-se que o PMG está acessível: `curl -k https://IP-PMG:8006`

---

## 📊 Diferenças da Versão Node.js

| Característica | Node.js | Flask/Python |
|----------------|---------|--------------|
| Compilação | ✅ Necessária | ❌ Não precisa |
| Dependências | ~500 MB | ~50 MB |
| Inicialização | ~5-10s | Instantâneo |
| Mailgun | Por domínio | **Global (todos os domínios)** |
| Interface | Básica | **Dark/Nerd/Geek** |
| Easter Eggs | ❌ | ✅ Konami, Matrix, Hacker |

---

## 🎯 Próximos Passos

1. ✅ Instalar e configurar
2. ✅ Acessar dashboard
3. ✅ Testar easter eggs
4. 🔜 Configurar alertas (futuro)
5. 🔜 Adicionar mais servidores (futuro)

---

## 💚 Suporte

Dúvidas? Abra uma issue no GitHub:
[https://github.com/Helbertmgdata/mgdata](https://github.com/Helbertmgdata/mgdata)

---

**Desenvolvido com 💚 por MGData**

🎮 **Divirta-se!**
