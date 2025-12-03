# Notification Service

Serviço de notificações por email para o Sistema de Eventos, desenvolvido com NestJS.

## 📋 Descrição

O Notification Service é responsável por enviar emails de notificação para os usuários em diversos eventos do sistema, como criação de conta, códigos temporários, alteração de senha, inscrições em eventos, entre outros.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **Nodemailer** - Envio de emails
- **Handlebars** - Templates de email
- **Swagger** - Documentação da API
- **TypeScript** - Linguagem de programação

## 📧 Tipos de Email

O serviço suporta os seguintes tipos de notificação:

1. **Criação de Conta** - Email de boas-vindas quando um usuário cria uma conta
2. **Código Temporário** - Envio de código de verificação para autenticação
3. **Alteração de Senha** - Confirmação de alteração de senha
4. **Exclusão de Conta** - Confirmação de exclusão de conta
5. **Inscrição em Evento** - Confirmação de inscrição em um evento
6. **Cancelamento de Inscrição** - Confirmação de cancelamento de inscrição
7. **Confirmação de Presença** - Confirmação de presença em um evento

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=8082
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=noreply@gmail.com
```

### Configuração do Gmail

Para usar o Gmail como provedor SMTP:

1. Acesse sua conta Google
2. Vá em **Segurança** > **Verificação em duas etapas**
3. Em **Senhas de app**, crie uma nova senha de app
4. Use essa senha no campo `SMTP_PASS` do arquivo `.env`

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 API Endpoints

Todos os endpoints estão disponíveis em `/api/notifications`:

### POST /api/notifications/account-created
Envia email de criação de conta.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com"
}
```

### POST /api/notifications/temporary-code
Envia email com código temporário.

**Body:**
```json
{
  "email": "joao.silva@example.com",
  "code": "123456",
  "expirationMinutes": 15
}
```

### POST /api/notifications/password-changed
Envia email de confirmação de alteração de senha.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com"
}
```

### POST /api/notifications/account-deleted
Envia email de confirmação de exclusão de conta.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com"
}
```

### POST /api/notifications/event-registration
Envia email de confirmação de inscrição em evento.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "eventName": "Workshop de Desenvolvimento Web",
  "eventDate": "15/12/2025 às 14:00",
  "eventLocation": "Auditório Principal"
}
```

### POST /api/notifications/event-cancellation
Envia email de cancelamento de inscrição.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "eventName": "Workshop de Desenvolvimento Web",
  "eventDate": "15/12/2025 às 14:00"
}
```

### POST /api/notifications/attendance-confirmed
Envia email de confirmação de presença.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "eventName": "Workshop de Desenvolvimento Web",
  "eventDate": "15/12/2025 às 14:00"
}
```

## 📖 Documentação Swagger

Acesse a documentação interativa da API em:

```
http://localhost:8082/swagger-ui.html
```

## 🎨 Templates de Email

Os templates de email estão localizados em `src/notification/templates/` e são escritos em Handlebars (`.hbs`).

Cada template possui:
- Design responsivo
- Estilo inline para compatibilidade com clientes de email
- Conteúdo em português
- Visual profissional com gradientes e cores modernas

### Personalização de Templates

Para personalizar um template:

1. Navegue até `src/notification/templates/`
2. Edite o arquivo `.hbs` desejado
3. Use variáveis Handlebars para dados dinâmicos: `{{variavel}}`
4. Mantenha o CSS inline para melhor compatibilidade

## 🐳 Docker

O serviço pode ser executado via Docker:

```bash
# Build
docker build -t notification-service .

# Run
docker run -p 8082:8082 --env-file .env notification-service
```

Ou usando docker-compose (na raiz do projeto):

```bash
docker-compose up notification-service
```

## 🔧 Estrutura do Projeto

```
src/
├── config/
│   └── email.config.ts          # Configuração do Mailer
├── notification/
│   ├── dto/                     # Data Transfer Objects
│   ├── templates/               # Templates de email
│   ├── notification.controller.ts
│   ├── notification.service.ts
│   └── notification.module.ts
├── app.module.ts
└── main.ts
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📝 Logs

O serviço registra logs para todas as operações de envio de email:

- ✅ Sucesso: `Email de [tipo] enviado para [email]`
- ❌ Erro: `Erro ao enviar email de [tipo] para [email]`

## 🔒 Segurança

- Nunca commite o arquivo `.env` com credenciais reais
- Use senhas de app específicas para SMTP
- Valide todos os dados de entrada com DTOs
- Mantenha as dependências atualizadas

## 🤝 Integração com Outros Serviços

Este serviço deve ser chamado pelos outros microserviços (user-service, events-service) quando eventos relevantes ocorrerem:

```typescript
// Exemplo de chamada do user-service
await axios.post('http://localhost:8082/api/notifications/account-created', {
  name: user.name,
  email: user.email
});
```

## 📄 Licença

Este projeto faz parte do sistema de microserviços para gerenciamento de eventos.
