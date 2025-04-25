# 🍅 Pomoverso

Um temporizador Pomodoro avançado e rastreador de atividades baseado na web, projetado para ajudar a gerenciar seu tempo de foco e descanso, registrar suas tarefas e visualizar seu progresso. Esta aplicação funciona inteiramente no seu navegador usando Local Storage para persistência de dados.

![image](https://github.com/user-attachments/assets/3a63499c-8c91-49d3-93c8-1d1ea8e3935b)


## ✨ Funcionalidades Principais

*   **Modos de Timer:**
    *   **Pomodoro Clássico:** Sequência configurável de ciclos de trabalho/descanso.
    *   **Foco/Descanso Livre:** Cronômetro crescente para sessões de foco e descanso de duração livre.
*   **Configuração Flexível (Pomodoro):**
    *   Sequência de ciclos personalizada (múltiplos blocos com durações e repetições diferentes).
    *   Presets comuns (25/5, 50/10, etc.).
    *   Intervalo e duração de Descanso Longo configuráveis.
    *   Opção de início automático para trabalho e/ou descanso.
*   **Registro de Atividades:**
    *   Log automático para ciclos Pomodoro.
    *   Log manual para sessões de Foco/Descanso Livre.
    *   **Entrada Manual:** Adicione registros de atividades que não foram cronometradas através de um modal dedicado.
    *   Campos para Tarefa, Categoria e Notas por sessão.
*   **Gerenciamento de Dados:**
    *   **Tarefas/Categorias Salvas:** Salve tarefas e categorias frequentemente usadas para fácil acesso e consistência.
    *   **Gerenciar Itens Salvos:** Modal para visualizar e remover tarefas/categorias salvas.
    *   Visualização do log em tabela.
    *   Exclusão de registros individuais.
    *   Limpeza completa do log.
    *   **Exportar Dados:** Baixe todas as configurações, metas e logs como um arquivo `.json`.
    *   **Importar Dados:** Restaure configurações, metas e logs de um arquivo `.json`.
    *   **Baixar CSV:** Exporte apenas o registro de atividades como um arquivo `.csv`.
*   **Estatísticas e Progresso:**
    *   **Visuais (Gráficos):**
        *   Tempo por Categoria (Pizza/Doughnut)
        *   Tempo por Tarefa (Top 5 - Barras)
        *   Atividade Diária (Ciclos vs Minutos Foco/Trab/Man - Linha/Área - Últimos 7 dias)
        *   Foco/Trab/Manual vs. Descanso Diário (Barras Empilhadas - Últimos 7 dias)
        *   Atividade por Hora do Dia (Barras)
    *   **Resumo Rápido (Texto):** Totais e médias de hoje, semana e geral.
    *   **Barra de Progresso Diário:** Acompanhe seus minutos de foco/trabalho/manual em relação a uma meta diária (padrão 180 min).
*   **Metas Personalizadas:**
    *   Defina e acompanhe diversas metas (minutos de foco hoje/total, ciclos hoje/total, sessões de foco, dias consecutivos, minutos por categoria hoje/total).
    *   Notificações visuais e sonoras ao atingir metas.
    *   Marcadores de metas diárias concluídas na barra de progresso.
*   **Notificações:**
    *   **Sonoras:** Sons configuráveis separadamente para fim de trabalho/foco e fim de descanso. Controle de volume.
    *   **Navegador:** Notificações opcionais na área de trabalho ao final de cada fase (requer permissão).
*   **Interface e UX:**
    *   Tema Claro/Escuro com alternância.
    *   Design Responsivo.
    *   Citações motivacionais.
    *   Feedback visual (mudança de cor de fundo, toasts).
    *   Persistência de dados usando Local Storage.

## 🚀 Como Usar

### Acesse direto pelo site 

[* Link da pagina Pomoverso/](https://pomoverso.vercel.app/)

### Clonando o repositorio e acesso local

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    ```
2.  **Navegue até o diretório:**
    ```bash
    cd seu-repositorio
    ```
3.  **Abra o arquivo `index.html`** diretamente no seu navegador web preferido (Chrome, Firefox, Edge, etc.).

Não é necessário nenhum servidor web ou processo de build. A aplicação é totalmente client-side.

## 🛠️ Tecnologias Utilizadas

*   **HTML5**
*   **CSS3**
    *   Font Awesome (para ícones)
    *   Google Fonts (Poppins, Roboto Mono)
*   **JavaScript (ES6+)** (Vanilla JS)
*   **Chart.js** (v4.4.1 - para visualização de dados)
*   **Web Storage API (Local Storage)** (para persistência de dados no navegador)
*   **Vercel** (Deploy e dominio para acesso online)

## ⚙️ Configurações e Armazenamento

*   Todas as suas configurações (ciclos, sons, tema, metas, etc.) e registros de atividades são salvos no **Local Storage** do seu navegador. Isso significa que os dados são específicos para o navegador e o dispositivo que você está usando.
*   Limpar os dados do navegador (cache, cookies, dados de site) **apagará** seus registros e configurações do Pomoverso. Use as funções de **Exportar Dados** regularmente se quiser manter um backup.
*   As configurações podem ser ajustadas diretamente na interface do usuário, nas seções "Configurações Gerais", "Configurar Ciclos Pomodoro" e "Metas Personalizadas".

## 🤝 Contribuições

Contribuições, issues e sugestões de funcionalidades são bem-vindas! Sinta-se à vontade para abrir uma issue ou um Pull Request.

## 📄 Licença

Licenciado sob um modelo de código aberto permissivo (semelhante à licença MIT). Sinta-se à vontade para usar, copiar, modificar, fundir, publicar, distribuir, sublicenciar e/ou vender cópias do software, para qualquer finalidade, comercial ou não.

---

_Desenvolvido com foco e café!_ ☕





