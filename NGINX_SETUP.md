# 🌐 Configuração Nginx - InteliMon Dashboard

Este guia explica como configurar o Nginx para acessar o InteliMon Dashboard via IP interno.

---

## 📋 Pré-requisitos

- InteliMon Dashboard já instalado e funcionando
- Acesso root ao servidor

---

## 🚀 Instalação do Nginx

### AlmaLinux / CentOS / RHEL

```bash
# Instalar Nginx
sudo yum install -y nginx

# Habilitar e iniciar
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Ubuntu / Debian

```bash
# Instalar Nginx
sudo apt update
sudo apt install -y nginx

# Habilitar e iniciar
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## ⚙️ Configurar Nginx

### Passo 1: Copiar Configuração

```bash
# Copiar arquivo de configuração
sudo cp /opt/intelimon-flask/nginx.conf /etc/nginx/conf.d/intelimon.conf

# Ou criar manualmente
sudo nano /etc/nginx/conf.d/intelimon.conf
```

### Passo 2: Conteúdo da Configuração

```nginx
server {
    listen 80;
    server_name _;  # Aceita qualquer IP/hostname
    
    # Logs
    access_log /var/log/nginx/intelimon_access.log;
    error_log /var/log/nginx/intelimon_error.log;
    
    # Tamanho máximo de upload
    client_max_body_size 10M;
    
    # Proxy para Flask
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Cache de arquivos estáticos
    location /static/ {
        proxy_pass http://127.0.0.1:5000/static/;
        proxy_cache_valid 200 1d;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### Passo 3: Testar Configuração

```bash
# Testar sintaxe
sudo nginx -t

# Se OK, reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔥 Configurar Firewall

### AlmaLinux / CentOS / RHEL (firewalld)

```bash
# Permitir HTTP (porta 80)
sudo firewall-cmd --permanent --add-service=http

# Recarregar firewall
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-all
```

### Ubuntu / Debian (ufw)

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Verificar
sudo ufw status
```

---

## 🌐 Acessar Dashboard

Agora você pode acessar o dashboard via:

```
http://IP-DO-SERVIDOR
```

**Exemplos:**
- `http://192.168.99.30`
- `http://10.0.0.100`
- `http://mail.intelimail.com.br` (se tiver DNS configurado)

---

## 🔐 Segurança Adicional (Opcional)

### Restringir Acesso por IP

Edite `/etc/nginx/conf.d/intelimon.conf` e adicione:

```nginx
server {
    listen 80;
    server_name _;
    
    # Permitir apenas IPs específicos
    allow 192.168.99.0/24;  # Rede local
    allow 10.0.0.0/8;       # Outra rede
    deny all;               # Bloquear resto
    
    # ... resto da configuração
}
```

Depois reinicie:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Autenticação Básica

```bash
# Instalar utilitário
sudo yum install -y httpd-tools  # AlmaLinux/CentOS
# ou
sudo apt install -y apache2-utils  # Ubuntu/Debian

# Criar arquivo de senha
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Editar configuração
sudo nano /etc/nginx/conf.d/intelimon.conf
```

Adicione dentro do bloco `location /`:

```nginx
location / {
    auth_basic "InteliMon Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://127.0.0.1:5000;
    # ... resto
}
```

Reinicie:

```bash
sudo systemctl restart nginx
```

---

## 🔧 Troubleshooting

### Erro: "502 Bad Gateway"

**Causa:** Flask não está rodando

**Solução:**
```bash
# Verificar se Flask está rodando
sudo systemctl status intelimon

# Se não estiver, iniciar
sudo systemctl start intelimon
```

### Erro: "Connection refused"

**Causa:** Nginx não consegue conectar ao Flask

**Solução:**
```bash
# Verificar se Flask está escutando na porta 5000
sudo netstat -tlnp | grep 5000

# Verificar logs do Flask
sudo journalctl -u intelimon -n 50

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/intelimon_error.log
```

### Erro: "Permission denied"

**Causa:** SELinux bloqueando conexão

**Solução (AlmaLinux/CentOS):**
```bash
# Permitir Nginx fazer proxy
sudo setsebool -P httpd_can_network_connect 1

# Ou desabilitar SELinux (não recomendado em produção)
sudo setenforce 0
```

---

## 📊 Monitorar Logs

### Logs do Nginx

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/intelimon_access.log

# Logs de erro
sudo tail -f /var/log/nginx/intelimon_error.log
```

### Logs do Flask

```bash
# Logs do serviço
sudo journalctl -u intelimon -f

# Logs completos
sudo journalctl -u intelimon -n 100
```

---

## 🔄 Comandos Úteis

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Recarregar configuração (sem downtime)
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Ver processos Nginx
ps aux | grep nginx
```

---

## 🎯 Próximos Passos

1. ✅ Nginx instalado e configurado
2. ✅ Acesso via IP interno funcionando
3. 🔜 Configurar HTTPS (se necessário)
4. 🔜 Configurar domínio (se necessário)

---

## 💡 Dicas

- **Performance**: Nginx é muito mais rápido que acessar Flask diretamente
- **Segurança**: Nginx adiciona uma camada extra de proteção
- **Cache**: Arquivos estáticos são servidos mais rapidamente
- **Logs**: Logs separados facilitam troubleshooting

---

**Desenvolvido com 💚 por MGData**
