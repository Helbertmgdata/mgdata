#!/bin/bash

echo "================================================"
echo "  InteliMon Dashboard v2.0 - Instalação Rápida"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Instalando dependências do sistema...${NC}"
yum install -y python3 python3-pip || apt-get install -y python3 python3-pip

echo ""
echo -e "${BLUE}📦 Instalando dependências Python...${NC}"
pip3 install -r requirements.txt

echo ""
echo -e "${BLUE}📝 Configurando variáveis de ambiente...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
    echo -e "${RED}⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}"
    echo ""
    echo "Execute: nano .env"
    echo ""
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Configurando systemd service...${NC}"
cp intelimon.service /etc/systemd/system/
systemctl daemon-reload

echo ""
echo -e "${GREEN}✅ Instalação concluída!${NC}"
echo ""
echo "================================================"
echo "  Próximos passos:"
echo "================================================"
echo ""
echo "1. Editar configurações:"
echo "   nano .env"
echo ""
echo "2. Iniciar o serviço:"
echo "   systemctl start intelimon"
echo "   systemctl enable intelimon"
echo ""
echo "3. Verificar status:"
echo "   systemctl status intelimon"
echo ""
echo "4. Ver logs:"
echo "   journalctl -u intelimon -f"
echo ""
echo "5. Acessar no navegador:"
echo "   http://seu-servidor:5000"
echo ""
echo "================================================"
echo -e "${GREEN}🎮 Divirta-se com os easter eggs!${NC}"
echo "================================================"
