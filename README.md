This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Вход через Звоночек (OIDC)

Плавающая кнопка слева внизу логинит посетителя аккаунтом мессенджера
[Звоночек](https://zvo.is) и показывает его аватарку и ник. Звоночек — обычный
OpenID Connect провайдер (Authorization Code + PKCE S256, discovery, JWKS), так
что здесь нет ни его SDK, ни его bot-токена: bot-токен открывает Bot API бота,
а не вход пользователя.

### Настройка

1. В Звоночке открыть **BotCreator → бот → OAuth-приложения** и создать
   приложение:
   - `client_type` — **public** (у confidential-клиента redirect_uri обязан быть
     https, а локально у нас http);
   - `redirect_uri` — `http://127.0.0.1:3000/api/auth/zvonok/callback`;
   - scopes — `openid`, `profile` (аватар и ник приходят с `profile`).
2. Скопировать `client_id` в `.env.local` (см. `.env.example`) и задать
   `ZVONOK_AUTH_SECRET`.
3. `npm run dev` и открыть **http://127.0.0.1:3000** — именно по этому адресу,
   не по `localhost`: провайдер сверяет redirect_uri побайтово, а в список
   loopback-хостов (RFC 8252 §7.3) `localhost` не входит.

Для прода в том же приложении добавляется второй redirect_uri вида
`https://<домен>/api/auth/zvonok/callback`.

### Как устроено

| Файл | Роль |
|---|---|
| `src/lib/zvonok-auth.ts` | discovery, PKCE, подпись cookie, вычисление redirect_uri |
| `src/app/api/auth/zvonok/login` | редирект на экран согласия, PKCE-verifier в cookie |
| `src/app/api/auth/zvonok/callback` | сверка state/iss, обмен кода, профиль с `/userinfo` |
| `src/app/api/auth/zvonok/me` | текущий профиль для клиента |
| `src/app/api/auth/zvonok/logout` | отзыв токена у провайдера + сброс cookie |
| `src/hooks/use-zvonok-auth.ts` | состояние входа (один запрос профиля на страницу) |
| `src/components/zvonok-button.tsx` | кнопка и карточка профиля |
| `src/components/sidebar.tsx` | место кнопки: над музыкой, на мобилке — кружком над языком |

Профиль берётся с `/userinfo`, а не разбирается из `id_token`: это прямой
backchannel-запрос к провайдеру по TLS с только что полученным access-токеном,
поэтому отдельная проверка подписи JWT здесь ничего не добавляет.

## Деплой на Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
