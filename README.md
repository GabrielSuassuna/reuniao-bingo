# Bingo Dinâmico

Um aplicativo web interativo para criar e jogar cartelas de bingo personalizáveis em tempo real, ideal para reuniões, eventos online e jogos em grupo.

## Funcionalidades

### Cartelas Personalizáveis
- Crie cartelas de bingo com tamanhos de 3x3, 4x4 ou 5x5
- Edite o texto de cada célula individualmente
- Função de preenchimento aleatório com frases comuns de reuniões

### Sala Compartilhada
- Entre em uma sala compartilhada com outros jogadores
- Veja as cartelas de todos os participantes em tempo real
- Acompanhe quem está online na sala
- Histórico de marcações visível para todos

### Jogabilidade
- Marque e desmarque células durante o jogo
- Detecção automática de vitória (linha, coluna, diagonal ou cartela completa)
- Notificação visual quando alguém vence

## Como Usar

### Criação da Cartela
1. Ao entrar, escolha o tamanho da cartela (3x3, 4x4 ou 5x5)
2. Clique em cada célula para adicionar ou editar o texto
3. Use "Preencher Aleatório" para gerar conteúdo rapidamente 
4. Insira seu nome para entrar na sala compartilhada

### Jogando em Grupo
1. Após entrar na sala, você verá sua cartela e os outros jogadores conectados
2. Clique em qualquer célula da sua cartela para marcá-la quando o evento ocorrer
3. Acompanhe as marcações de todos os jogadores no histórico
4. Quando você completar uma linha, coluna ou diagonal, será declarado vencedor!

## Casos de Uso

- **Reuniões de trabalho**: Torne reuniões mais divertidas marcando clichês comuns
- **Eventos online**: Crie jogos personalizados para webinars ou transmissões
- **Salas de aula**: Atividades educativas e lúdicas para estimular a participação
- **Confraternizações**: Jogos temáticos para eventos sociais remotos

## Desenvolvimento

### Pré-requisitos
- Node.js 18.0 ou superior
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/reuniao-bingo.git

# Entre no diretório
cd reuniao-bingo

# Instale as dependências
npm install
# ou
yarn install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em http://localhost:3000.

### Tecnologias Utilizadas
- Next.js
- React
- TypeScript
- Socket.IO para comunicação em tempo real
- Tailwind CSS

## Licença

MIT