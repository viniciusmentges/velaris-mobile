# Velaris — Checklist de Submissão às Lojas

**App:** Velaris  
**Bundle ID / Package:** `br.com.velarisapp`  
**Versão:** 1.0.0 (buildNumber: 1 / versionCode: 1)  
**Backend:** `https://api.velarisapp.com.br`  
**Última atualização deste documento:** 2026-04-23

---

## Legenda

- ✅ Pronto
- ⚠️ Atenção / verificar antes de submeter
- ❌ Bloqueador — não submeter sem resolver
- 🕐 Pendente externo — não bloqueia submissão inicial se declarado corretamente

---

## 1. Checklist Apple App Store

### 1.1 Conta e Acesso
| # | Item | Status | Observação |
|---|---|---|---|
| 1 | Apple Developer Program ativo (USD 99/ano) | ⚠️ | Confirmar que a assinatura não está expirada |
| 2 | App criado no App Store Connect | ⚠️ | Confirmar que `br.com.velarisapp` está registrado |
| 3 | Bundle ID registrado no Developer Portal | ⚠️ | Deve coincidir exatamente com `app.json` |
| 4 | `ascAppId` preenchido no `eas.json` | ❌ | Substituir placeholder — App Store Connect → seu app → General → App Information → "Apple ID" |
| 5 | `appleId` preenchido no `eas.json` | ❌ | Seu email de login no developer.apple.com |
| 6 | `appleTeamId` preenchido no `eas.json` | ❌ | developer.apple.com → Account → Membership → Team ID |

### 1.2 Conta de Teste (Test Account)
| # | Item | Status | Observação |
|---|---|---|---|
| 7 | Conta de teste criada no backend | ❌ | Criar antes de submeter (ver seção 6) |
| 8 | Reviewer consegue fazer login sem Strava | ✅ | Login é username/senha, Strava é opcional |
| 9 | Reviewer consegue adicionar um tênis | ✅ | Fluxo disponível sem Strava |
| 10 | Reviewer consegue excluir a conta | ✅ | Botão presente em Perfil → "Excluir minha conta" |

### 1.3 Autenticação
| # | Item | Status | Observação |
|---|---|---|---|
| 11 | Login com username/senha funcional | ✅ | `POST /api/auth-token/` |
| 12 | Recuperação de senha funcional | ✅ | `POST /api/password_reset/` → email com link |
| 13 | Logout funcional | ✅ | Limpa token local, retorna para Welcome |
| 14 | Sign in with Apple | 🕐 | **Não implementado.** Apple recomenda mas não exige se o app não usa login social de terceiros. Velaris usa username/senha próprio — aceitável. |
| 15 | Sessão persiste entre aberturas | ✅ | Token em AsyncStorage |

### 1.4 Exclusão de Conta (Requisito Apple — OBRIGATÓRIO)
| # | Item | Status | Observação |
|---|---|---|---|
| 16 | Botão "Excluir minha conta" visível em Perfil | ✅ | Abaixo do botão "Sair da Conta" |
| 17 | Confirmação antes de deletar (Alert) | ✅ | Dois passos: Alert → "Excluir permanentemente" |
| 18 | Dados deletados no backend (cascade) | ✅ | `user.delete()` deleta Perfil, Shoes, Activities |
| 19 | Token Strava revogado ao deletar | ✅ | `POST /oauth/deauthorize` com best-effort |
| 20 | URL de exclusão declarada na Privacy Policy | ⚠️ | Apple exige URL ou instrução clara na política de privacidade |

### 1.5 Privacidade e Permissões
| # | Item | Status | Observação |
|---|---|---|---|
| 21 | Privacy Policy URL válida | ❌ | Preencher em App Store Connect → App Privacy |
| 22 | `NSMotionUsageDescription` removido | ✅ | Corrigido na Etapa 5 — sem uso de sensores de movimento |
| 23 | `ITSAppUsesNonExemptEncryption: false` | ✅ | Declara isenção de export compliance |
| 24 | Permissão de notificação solicitada em runtime | ✅ | `Notifications.requestPermissionsAsync()` na HomeScreen |
| 25 | `supportsTablet: false` | ✅ | App otimizado para iPhone apenas |
| 26 | Nutrition/Health data | ✅ | App não acessa HealthKit — sem necessidade de declaração |

### 1.6 Strava (integração opcional)
| # | Item | Status | Observação |
|---|---|---|---|
| 27 | App funciona 100% sem conectar Strava | ✅ | Strava é opt-in, não bloqueia uso do app |
| 28 | Strava OAuth usa `expo-auth-session` + redirect URI correto | ✅ | scheme `velaris://` configurado |
| 29 | Reviewer pode testar sem Strava | ✅ | Ver instruções na seção 6 |

### 1.7 Assinaturas / In-App Purchase
| # | Item | Status | Observação |
|---|---|---|---|
| 30 | RevenueCat SDK instalado | ❌ | **Pendente — Etapa 4 adiada** |
| 31 | Produto `velaris_premium_monthly` criado no App Store Connect | ❌ | Pendente conta PJ validada |
| 32 | Restore Purchases implementado | ❌ | Pendente RevenueCat |
| 33 | App funciona em plano gratuito sem compra | ✅ | Plano START funcional sem premium |
| 34 | Paywall acessível sem travar o app | ✅ | Modal fecha normalmente |

> **Nota para a review:** O app pode ser submetido inicialmente sem IAP se o fluxo de premium estiver desabilitado ou oculto. Alternativamente, submeter com nota explicando que o IAP será ativado em atualização futura.

### 1.8 Build e Assets
| # | Item | Status | Observação |
|---|---|---|---|
| 35 | `icon.png` presente (1024×1024) | ⚠️ | Arquivo existe — confirmar dimensões exatas |
| 36 | `splash-icon.png` presente | ✅ | Arquivo presente |
| 37 | `userInterfaceStyle: "dark"` | ✅ | App dark mode only |
| 38 | Orientation: portrait only | ✅ | `"orientation": "portrait"` |
| 39 | EAS Build com `credentialsSource: "remote"` | ✅ | Certificados gerenciados pelo EAS |

---

## 2. Checklist Google Play

### 2.1 Conta e Acesso
| # | Item | Status | Observação |
|---|---|---|---|
| 1 | Conta Google Play Developer ativa (USD 25 única vez) | ⚠️ | Confirmar que a conta não está suspensa |
| 2 | App criado no Google Play Console | ⚠️ | Confirmar que `br.com.velarisapp` está registrado |
| 3 | `google-service-account.json` criado e salvo | ❌ | Google Play Console → Setup → API access → Create service account → Download JSON |
| 4 | Conta de serviço com permissão "Release Manager" | ❌ | Configurar no Google Play Console após criar a service account |

### 2.2 Conta de Teste
| # | Item | Status | Observação |
|---|---|---|---|
| 5 | Conta de teste criada para reviewer | ❌ | Criar antes de submeter (ver seção 6) |
| 6 | Credenciais preenchidas em "App Access" no Play Console | ❌ | Ver seção 2.3 e texto pronto na seção 5B |
| 7 | Reviewer consegue usar o app sem Strava | ✅ | Strava é opcional |

### 2.3 App Access (Acesso Restrito)
Preencher no Google Play Console → Content rating → App Access:

> O app requer criação de conta para funcionar. Isso é necessário porque o serviço é baseado em perfil individual de corredor, com histórico de atividades e tênis vinculados à conta. A exclusão de conta está disponível dentro do app (Perfil → Excluir minha conta).
>
> **Credenciais de teste:**  
> Username: `[PREENCHER — ver seção 6]`  
> Senha: `[PREENCHER — ver seção 6]`

### 2.4 Exclusão de Conta (Requisito Google Play — OBRIGATÓRIO desde 2024)
| # | Item | Status | Observação |
|---|---|---|---|
| 8 | Exclusão disponível dentro do app | ✅ | Perfil → "Excluir minha conta" |
| 9 | Exclusão disponível sem abrir o app (URL web) | ❌ | Google Play exige URL web para exclusão. Opções: página no site, formulário, ou endpoint web. |
| 10 | URL de exclusão declarada no Play Console | ❌ | Preencher após criar URL web |

> **Ação necessária:** Criar uma página simples em `velarisapp.com.br/deletar-conta` (ou formulário) que permita ao usuário solicitar exclusão da conta via email/formulário. Isso é requisito obrigatório do Google Play desde dezembro de 2023.

### 2.5 Data Safety (Seção de Privacidade de Dados)
Preencher em Google Play Console → Policy → Data safety.

**Dados coletados e finalidade:**

| Categoria | Dado | Coletado | Finalidade | Compartilhado |
|---|---|---|---|---|
| Informações pessoais | Nome | Sim | Funcionalidade do app | Não |
| Informações pessoais | Email | Sim | Conta, recuperação de senha | Não |
| Informações pessoais | Data de nascimento | Sim | Personalização biomecânica | Não |
| Informações pessoais | Peso e altura | Sim | Cálculo de impacto PST V2.1 | Não |
| Informações pessoais | Número de telefone (WhatsApp) | Sim | Opcional, ofertas personalizadas (com consentimento) | Somente com consentimento explícito (aceita_marketing) |
| Informações pessoais | Cidade | Sim | Opcional, personalização | Não |
| Atividade do app | Histórico de corridas (distância, duração, tipo) | Sim | Análise de desgaste do tênis | Não |
| Atividade do app | Dados de tênis (marca, modelo, km rodados) | Sim | Funcionalidade core do app | Não |
| Identificadores | Token de notificação push (Expo) | Sim | Envio de push notifications | Expo Push Service |
| Identificadores | Strava athlete ID e tokens OAuth | Sim (apenas se conectar Strava) | Sincronização de corridas | Strava API |
| Dados financeiros | Nenhum | Não | — | — |
| Localização precisa | Nenhum | Não | — | — |
| Localização aproximada | Cidade (texto livre) | Sim | Opcional | Não |

**Respostas para o formulário Data Safety:**
- Coleta dados de usuários? **Sim**
- Dados criptografados em trânsito? **Sim** (HTTPS/TLS)
- Usuário pode solicitar exclusão? **Sim**
- Dados compartilhados com terceiros? **Sim** — Expo Push Service (token de notificação), Strava API (somente se usuário conectar)
- Dados usados para rastreamento? **Não**

### 2.6 Permissões Android
| # | Permissão | Declarada | Uso Real |
|---|---|---|---|
| 11 | `android.permission.INTERNET` | ✅ | Comunicação com API backend e Expo |
| 12 | `android.permission.VIBRATE` | ✅ | Notificações push |
| 13 | Localização | Não | App não usa GPS |
| 14 | Câmera | Não | App não usa câmera |
| 15 | Contatos | Não | App não acessa contatos |

### 2.7 Content Rating
| # | Item | Status | Observação |
|---|---|---|---|
| 16 | Questionário de classificação etária preenchido | ⚠️ | Preencher no Play Console — app de fitness, esperado PEGI 3 / Everyone |
| 17 | App não contém violência, conteúdo adulto ou jogos | ✅ | App de corrida/fitness |

### 2.8 Build Android
| # | Item | Status | Observação |
|---|---|---|---|
| 18 | `buildType: "app-bundle"` no profile production | ✅ | Correto para Play Store |
| 19 | `versionCode: 1` | ✅ | Primeiro envio |
| 20 | `autoIncrement: true` no EAS | ✅ | EAS incrementa automaticamente |
| 21 | `adaptive-icon.png` presente | ✅ | Arquivo presente em assets/ |

---

## 3. RevenueCat — O que falta (pendência completa)

Esta seção documenta exatamente o que precisa ser feito quando a conta PJ estiver validada e os produtos criados nas lojas.

### 3.1 Pré-requisitos externos (fora do código)
| # | Item | Onde fazer |
|---|---|---|
| 1 | Conta PJ validada no RevenueCat | app.revenuecat.com |
| 2 | Produto `velaris_premium_monthly` criado no App Store Connect | App Store Connect → Monetization → In-App Purchases |
| 3 | Assinatura `velaris_premium_monthly` criada no Google Play | Play Console → Monetization → Subscriptions |
| 4 | App Store Connect conectado ao RevenueCat | RevenueCat Dashboard → seu app → iOS → App Store Connect API key |
| 5 | Google Play conectado ao RevenueCat | RevenueCat Dashboard → seu app → Android → Google Play service account |
| 6 | Entitlement criado: `premium` | RevenueCat → Entitlements → + New |
| 7 | Offering criado: `default` | RevenueCat → Offerings → + New |
| 8 | Package criado: `monthly` vinculado a `velaris_premium_monthly` | RevenueCat → Offerings → default → + Package |
| 9 | RevenueCat API Key pública anotada | RevenueCat → Project Settings → API Keys |

### 3.2 O que implementar no código (Etapa 4 — pendente)
| # | Item | Arquivo |
|---|---|---|
| 10 | Instalar `react-native-purchases` | `package.json` via `npx expo install react-native-purchases` |
| 11 | Criar `src/services/revenueCat.js` | Novo arquivo — initialize, getOfferings, purchasePackage, restorePurchases |
| 12 | Inicializar RevenueCat no `App.js` | Após checkLogin, antes de renderScreen |
| 13 | Verificar entitlement no startup e definir estado premium local | `App.js` |
| 14 | Wiring do `PlansScreen.js` — botão de compra real | `src/screens/PlansScreen.js` |
| 15 | Wiring do `PricingModal` em `HomeScreen.js` | `onUpgrade` precisa chamar `purchasePackage` |
| 16 | Botão "Restaurar Compras" em `ProfileScreen.js` | Obrigatório Apple — `Purchases.restorePurchases()` |
| 17 | Após compra bem-sucedida: `POST /api/perfil/ativar_premium/` | Sync com backend |
| 18 | Tratar erros de compra (cancelamento, rede, já tem assinatura) | Alerts no fluxo de compra |

---

## 4. Strava — Explicação para Reviewers

### Para o App Reviewer (Apple e Google)

O Velaris é um aplicativo de análise biomecânica de tênis de corrida. **O Strava é uma integração opcional** para importar automaticamente corridas já realizadas.

**O app funciona completamente sem Strava:**
- O usuário pode cadastrar tênis manualmente
- O usuário pode registrar corridas manualmente
- Todas as análises de desgaste funcionam sem Strava
- O login é feito com username e senha próprios do Velaris

**Se o reviewer quiser testar a integração com Strava:**
1. É necessário ter uma conta Strava com ao menos uma corrida registrada
2. Na tela inicial, tocar em "Conectar com Strava"
3. Será aberto o browser do dispositivo para autenticação OAuth na Strava
4. Após autorizar, as corridas são importadas automaticamente em background
5. O reviewer pode desconectar o Strava a qualquer momento em Perfil → Strava

**Dados acessados do Strava:**
- Apenas atividades do tipo corrida (Run, TrailRun, VirtualRun)
- Distância, duração e data — nenhum dado de saúde sensível
- O acesso pode ser revogado pelo usuário a qualquer momento

**A conta de teste fornecida não precisa do Strava para demonstrar a funcionalidade principal do app.**

---

## 5. Textos Prontos para Submissão

### 5A — Apple App Review Notes (campo "Notes for Reviewer")

```
Velaris — Biomechanical shoe wear tracker for runners.

TEST ACCOUNT (no Strava required):
  Username: [PREENCHER — ver seção 6]
  Password: [PREENCHER — ver seção 6]

HOW TO TEST CORE FUNCTIONALITY:
1. Log in with the test credentials above.
2. Tap "+" to add a running shoe (a sample shoe is pre-added to the test account).
3. View shoe wear analysis and insights on the Home screen.
4. Go to Profile to view and edit personal information.
5. To test account deletion: Profile → "Excluir minha conta" (Delete account).
6. To test password recovery: Welcome → Login → "Esqueceu a senha?" (Forgot password).

STRAVA INTEGRATION (optional):
Strava is an optional feature for auto-importing runs. The app works fully without it. 
If you wish to test Strava: on the Home screen, tap "Conectar com Strava" and authorize 
with a Strava account. You can disconnect at any time from the Profile screen.

IN-APP PURCHASES:
The Premium subscription is currently disabled pending final App Store Connect product 
configuration. The free plan (START) provides full access to all core features for review purposes.

ACCOUNT DELETION:
Account deletion is available within the app at: Profile → "Excluir minha conta".
All user data (profile, shoes, activity history) is permanently deleted immediately.
```

---

### 5B — Google Play "App Access" (campo de instruções de acesso)

```
Este app requer cadastro e login para funcionar, pois o serviço é baseado em perfil 
individual de corredor com histórico de atividades e tênis vinculados à conta.

CREDENCIAIS DE TESTE:
  Usuário: [PREENCHER — ver seção 6]
  Senha: [PREENCHER — ver seção 6]

COMO TESTAR:
1. Faça login com as credenciais acima.
2. Na tela inicial, visualize os tênis cadastrados e análises de corrida.
3. Adicione um novo tênis pelo botão "+".
4. Em Perfil, edite informações pessoais ou exclua a conta.

INTEGRAÇÃO STRAVA (opcional):
O app funciona sem Strava. A integração Strava sincroniza corridas automaticamente 
e pode ser ativada ou desativada a qualquer momento em Perfil.

EXCLUSÃO DE CONTA:
Disponível em: Perfil → "Excluir minha conta". Todos os dados são removidos permanentemente.
URL alternativa para exclusão: [PREENCHER — ex: velarisapp.com.br/deletar-conta]
```

---

### 5C — Google Play Data Safety — Resumo

```
O Velaris coleta dados pessoais (nome, email, data de nascimento, peso, altura, 
tamanho do calçado e cidade) para personalizar a análise biomecânica de desgaste 
de tênis. Dados de corridas (distância, duração, tipo de atividade) são coletados 
manualmente ou via integração opcional com Strava.

Dados de notificação (token de push) são compartilhados com o serviço Expo Push 
exclusivamente para envio de notificações do próprio app.

Dados de WhatsApp e autorização para ofertas personalizadas são coletados apenas 
com consentimento explícito do usuário e podem ser revogados a qualquer momento 
nas configurações de Privacidade do app.

Todos os dados são transmitidos via HTTPS/TLS. O usuário pode solicitar a exclusão 
completa de sua conta e dados diretamente no app (Perfil → Excluir minha conta) 
ou em: [PREENCHER — URL de exclusão web].

Não coletamos dados de localização precisa, dados de saúde do sistema operacional, 
informações financeiras ou dados de contatos.
```

---

### 5D — Texto sobre Exclusão de Conta (Privacy Policy / App Store)

```
Exclusão de Conta

Você pode excluir permanentemente sua conta Velaris e todos os seus dados a qualquer 
momento diretamente no app:

  Abra o app → Perfil → Role até o final → "Excluir minha conta"

A exclusão remove imediatamente e permanentemente:
- Seu perfil e informações pessoais
- Histórico de corridas e análises
- Todos os tênis cadastrados
- Sua conexão com o Strava (se existente)

Esta ação é irreversível. Após a exclusão, não é possível recuperar os dados.

Você também pode solicitar a exclusão por email: [PREENCHER — suporte@velarisapp.com.br]
Ou pela URL: [PREENCHER — velarisapp.com.br/deletar-conta]
```

---

### 5E — Texto sobre Uso do Strava (Privacy Policy)

```
Integração com Strava (opcional)

O Velaris oferece integração opcional com a plataforma Strava para importar 
automaticamente suas corridas. Esta integração é completamente opcional — o app 
funciona sem ela.

Ao conectar sua conta Strava, o Velaris acessa:
- Lista de atividades do tipo corrida (Run, TrailRun, VirtualRun)
- Distância, duração e data de cada atividade
- Nenhum dado de saúde, pagamento ou localização em tempo real

Os tokens de acesso Strava são armazenados de forma segura e utilizados apenas 
para sincronizar suas corridas. Você pode desconectar o Strava a qualquer momento 
em Perfil → Configurações Strava. Ao desconectar ou excluir sua conta, todos os 
tokens Strava são revogados e removidos.
```

---

### 5F — Texto sobre Política de Privacidade (resumo para lojas)

```
Política de Privacidade — Velaris

O Velaris respeita sua privacidade e opera em conformidade com a LGPD (Lei Geral 
de Proteção de Dados — Lei 13.709/2018).

Dados coletados: informações de perfil (nome, email, medidas físicas), histórico 
de corridas e dados de tênis para análise de desgaste biomecânico.

Base legal: execução de contrato (prestação do serviço) e consentimento (para 
comunicações de marketing, quando autorizado).

Seus direitos: acesso, correção, portabilidade e exclusão dos seus dados a qualquer 
momento, diretamente no app.

Contato DPO: [PREENCHER — dpo@velarisapp.com.br ou email de contato]
Política completa: [PREENCHER — velarisapp.com.br/privacidade]
```

---

## 6. Conta de Teste — Template

Criar esta conta no backend de produção antes de submeter. **Não usar conta real de usuário.**

```
USERNAME:    velaris_reviewer
SENHA:       [PREENCHER — senha forte, mínimo 12 caracteres]
EMAIL:       reviewer@velarisapp.com.br  (ou endereço que você controle)
PLANO:       START (gratuito — plano default)
NOME:        Reviewer Test
PESO:        70 kg
ALTURA:      175 cm
CALÇADO:     42 (BR)
CIDADE:      São Paulo

PRÉ-POPULAR A CONTA COM:
- 1 tênis cadastrado (ex: Nike Pegasus 41, 250 km)
- 2-3 corridas registradas manualmente (ex: 5 km, 8 km, 10 km)
- Isso garante que o reviewer veja análises reais ao abrir o app

OBSERVAÇÕES:
- Não conectar Strava nesta conta de teste
- Manter a conta ativa durante todo o período de review (pode levar 2-7 dias)
- Após aprovação, você pode deletar ou manter como conta de suporte
```

**Como criar via API de produção:**
```bash
curl -X POST https://api.velarisapp.com.br/api/perfil/registro/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "velaris_reviewer",
    "password": "[SUA_SENHA_AQUI]",
    "email": "reviewer@velarisapp.com.br",
    "nome": "Reviewer Test"
  }'
```

---

## 7. Riscos Finais

### 🔴 Bloqueadores — Não submeter sem resolver

| # | Bloqueador | Ação necessária |
|---|---|---|
| B1 | Placeholders Apple no `eas.json` (`appleId`, `ascAppId`, `appleTeamId`) | Preencher com dados reais do Apple Developer |
| B2 | `google-service-account.json` não existe | Gerar no Google Play Console e salvar na raiz do projeto mobile |
| B3 | Privacy Policy URL não cadastrada no App Store Connect e Play Console | Criar página de política e preencher a URL nas lojas |
| B4 | Conta de teste não criada | Criar via API (ver seção 6) antes de submeter |
| B5 | URL de exclusão de conta web não existe | Criar página/formulário em `velarisapp.com.br/deletar-conta` (obrigatório Google Play) |

### 🟡 Pendências Externas — Não bloqueiam submissão inicial se declaradas corretamente

| # | Pendência | Situação |
|---|---|---|
| P1 | RevenueCat não integrado | Premium desabilitado — submeter com nota ao reviewer (ver 5A) |
| P2 | `velaris_premium_monthly` não criado nas lojas | Produto IAP pode ser configurado após aprovação inicial |
| P3 | `DEBUG=True` no Render? | Verificar variáveis de ambiente no painel Render — deve ser `False` em prod |
| P4 | Email backend SMTP configurado? | Verificar `settings.py` — recuperação de senha não funciona se `EMAIL_BACKEND` for console |
| P5 | Classificação etária (IARC/PEGI) | Preencher questionário no Play Console — esperado "Everyone" |

### 🟢 Não bloqueadores — Podem ir para atualização futura

| # | Item | Observação |
|---|---|---|
| N1 | `@react-navigation/*` instalado mas não usado | Dead dependency — bundle ligeiramente maior, não afeta funcionamento |
| N2 | `@expo-google-fonts/syne` instalado mas não usado | Idem acima |
| N3 | `console.log` em App.js (logs de inicialização) | Não expõem dados sensíveis — aceitável para v1.0 |
| N4 | `App.js.backup`, `App.js.debug`, `App.js.test_nav` na raiz | Arquivos de debug — não vão para o bundle, mas organizar antes de abrir o repo |
| N5 | Sign in with Apple não implementado | Não obrigatório se app não usa nenhum login social |
| N6 | Restore Purchases sem RevenueCat | Obrigatório Apple quando IAP existir — implementar junto com Etapa 4 |

---

## 8. Ordem Final Antes de Submeter

```
FASE 1 — ANTES DO BUILD (fazer agora)
  [ ] Preencher eas.json: appleId, ascAppId, appleTeamId
  [ ] Gerar e salvar google-service-account.json
  [ ] Verificar DEBUG=False no Render
  [ ] Verificar EMAIL_BACKEND com SMTP no Django settings
  [ ] Criar conta de teste (seção 6) e pré-popular com tênis/corridas
  [ ] Criar URL de exclusão de conta web (obrigatório Google Play)
  [ ] Criar/publicar Privacy Policy URL

FASE 2 — BUILD
  [ ] eas build --platform all --profile production
  [ ] Verificar que o build passou sem erros no EAS dashboard

FASE 3 — CONFIGURAÇÃO DAS LOJAS (antes de submeter)
  [ ] App Store Connect: preencher metadados, screenshots, descrição
  [ ] App Store Connect: preencher App Privacy (Data types)
  [ ] App Store Connect: preencher Privacy Policy URL
  [ ] Play Console: preencher Data Safety (seção 2.5)
  [ ] Play Console: preencher App Access (seção 5B)
  [ ] Play Console: preencher questionário de classificação etária
  [ ] Play Console: configurar service account (google-service-account.json)

FASE 4 — SUBMISSÃO
  [ ] eas submit --platform android --profile production
  [ ] eas submit --platform ios --profile production

FASE 5 — APÓS APROVAÇÃO (próxima atualização)
  [ ] Implementar RevenueCat (Etapa 4)
  [ ] Criar produtos IAP nas lojas
  [ ] Submeter atualização com monetização ativa
```

---

*Documento gerado em 2026-04-23. Atualizar após cada etapa concluída.*
