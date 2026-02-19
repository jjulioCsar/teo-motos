# 🚀 Guia de Implantação (Deployment) - LOJA MOTOS

Este projeto foi construído com **Next.js 14+** e **Supabase**. Ele está pronto para ser hospedado em plataformas modernas como **Vercel** ou **Netlify**.

## 1. Pré-requisitos

Para colocar o site no ar, você precisa de:
1.  Uma conta no [GitHub](https://github.com) (para guardar o código).
2.  Uma conta na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (para hospedar o site).
3.  Seu projeto no [Supabase](https://supabase.com) (onde ficam os dados).

## 2. Passo a Passo para Vercel (Recomendado)

1.  **Suba o código para o GitHub:**
    *   Crie um repositório novo no GitHub.
    *   Faça o upload dos arquivos da pasta `web`.
2.  **Conecte na Vercel:**
    *   Vá em "Add New Project".
    *   Selecione o repositório do GitHub que você criou.
3.  **Configure as Variáveis de Ambiente:**
    *   Na tela de configuração da Vercel, procure a seção **Environment Variables**.
    *   Adicione as seguintes chaves (copie os valores do seu arquivo `.env.local` atual):
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  **Deploy:**
    *   Clique em **Deploy**. A Vercel vai construir o site e te dar uma URL (ex: `loja-motos.vercel.app`).

## 3. Acesso Administrativo (/gestao)

O acesso administrativo continua **idêntico**.
*   Acesse `https://seu-site.vercel.app/gestao` (ou `/teomotos/gestao`).
*   **Login:** Use o mesmo email (`teomotos@gmail.com`) e senha que você usa localmente.
*   **Por que funciona?** Porque o banco de dados (Supabase) é o mesmo. O site é apenas a "fachada", os dados estão seguros na nuvem.

## 4. Backup dos Dados

Sempre que quiser salvar uma cópia física dos seus dados:
1.  Abra o terminal na pasta do projeto.
2.  Rode: `node scripts/backup_database.js`
3.  Uma pasta `backup/` será criada com todos os seus clientes, motos e vendas em arquivos JSON.

## 5. Segurança

*   **HTTPS:** É ativado automaticamente pela Vercel/Netlify.
*   **Dados:** Estão protegidos pelas regras (RLS) do Supabase. Ninguém consegue ver dados de outra loja.

---
**Dúvidas?** Consulte a documentação do [Next.js Deployment](https://nextjs.org/docs/deployment).
