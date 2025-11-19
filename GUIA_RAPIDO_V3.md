# 🚀 Guia Rápido - InteliMon Dashboard v3.0

## Instalação em 5 Minutos

### 1. Extrair o Projeto
```bash
cd /opt
unzip intelimon-dashboard-v3.0.zip
cd intelimon-dashboard-v3
```

### 2. Criar Ambiente Virtual
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 4. Configurar Credenciais
```bash
nano .env
```

Preencha com suas credenciais:
```
POSTMARK_SERVER_TOKEN=seu_token
POSTMARK_ACCOUNT_TOKEN=seu_token
MAILGUN_API_KEY=sua_chave
PMG_HOST=seu_pmg
SERVER_HOST=seu_servidor
WHM_HOST=seu_whm
WHM_API_TOKEN=seu_token
```

### 5. Iniciar
```bash
python app/app.py
```

Acesse: `http://localhost:5000`

---

## 🎮 Testar o Easter Egg

1. Abra o dashboard
2. Digite no teclado: `↑↑↓↓←→←→BA`
3. O Digivice aparecerá!
4. Clique em "Analisar Sistema" para ver a análise completa

---

## 🔧 Instalar como Serviço

```bash
sudo cp intelimon.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start intelimon
sudo systemctl enable intelimon
```

---

## 🎵 Adicionar Música (Opcional)

1. Baixe "Butterfly - Digimon Adventure" (MP3)
2. Coloque em: `app/static/audio/digimon-adventure.mp3`
3. Recarregue a página

---

## ✅ Pronto!

Seu InteliMon Dashboard v3.0 está rodando!

**Não esqueça do Konami Code:** `↑↑↓↓←→←→BA` 🎮
