export type Locale = "ru" | "en";

export const translations = {
  ru: {
    nav: {
      home: "Главная",
      about: "Обо мне",
      projects: "Проекты",
      contacts: "Контакты",
    },
    home: {
      greeting: "Привет, я",
      name: "Игорь",
      role: "AI Fullstack Разработчик",
      descriptionPrefix: "Создаю",
      descriptionRotating: ["современные", "стабильные", "красивые", "быстрые", "удобные"],
      descriptionSuffix: "веб-приложения с чистым кодом",
    },
    about: {
      title: "Обо мне",
      bio: "Я fullstack-разработчик, специализируюсь на React, Next.js, TypeScript и Node.js. Увлечён чистым кодом, производительностью и созданием интуитивных интерфейсов.",
      bioStory: "Начал программировать в 17 лет — с нуля, как и все. Спустя год открыл для себя AI-инструменты разработки, и это стало переломным моментом. Cursor и подобные инструменты вывели мою продуктивность на принципиально новый уровень: то, что раньше занимало неделю, теперь укладывается в день. Я активно продвигаю AI в разработке, но убеждён — без глубокого понимания кода это просто бессмысленный промптинг. ИИ усиливает разработчика, но не заменяет его.",
      skills: "Навыки",
      experience: "Опыт работы",
    },
    projects: {
      title: "Проекты",
      viewCode: "Код",
      viewDemo: "Демо",
      stars: "Звёзды",
      loading: "Загрузка проектов...",
      error: "Не удалось загрузить проекты",
    },
    contacts: {
      title: "Контакты",
      subtitle: "Свяжитесь со мной",
      telegram: "Telegram",
      email: "Почта",
      hh: "HeadHunter",
    },
    music: {
      on: "Музыка вкл",
      off: "Музыка выкл",
    },
    theme: {
      light: "Светлая тема",
      dark: "Тёмная тема",
      system: "Системная",
    },
    zvonok: {
      login: "Войти через Звоночек",
      loginShort: "Звоночек",
      logout: "Выйти",
      signedInAs: "Вы вошли как",
      failed: "Не удалось войти",
      tooltip: "Звоночек — мой мессенджер",
      modalTitle: "Вход через Звоночек",
      modalLead:
        "Это OAuth-авторизация через «Звоночек» — мессенджер, который я написал сам.",
      modalBody:
        "Он встроен прямо в это портфолио — для теста: нажимаете «Попробовать», входите в своём аккаунте Звоночка, и сюда возвращается ваш профиль — имя и аватар. Ничего, кроме них, портфолио не получает.",
      modalTry: "Попробовать",
      modalAbout: "Открыть Звоночек",
      close: "Закрыть",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      projects: "Projects",
      contacts: "Contacts",
    },
    home: {
      greeting: "Hi, I'm",
      name: "Igor",
      role: "AI Fullstack Developer",
      descriptionPrefix: "Building",
      descriptionRotating: ["modern", "stable", "beautiful", "fast", "intuitive"],
      descriptionSuffix: "web applications with clean code",
    },
    about: {
      title: "About Me",
      bio: "I'm a fullstack developer specializing in React, Next.js, TypeScript, and Node.js. Passionate about clean code, performance, and creating intuitive interfaces.",
      bioStory: "I started coding at 17 — from scratch, like everyone else. A year in, I discovered AI-powered dev tools, and it was a game-changer. Cursor and similar tools took my productivity to a whole new level: what used to take a week now fits into a single day. I actively advocate for AI in development, but I firmly believe — without deep understanding of the code, it's just mindless prompting. AI amplifies a developer, but never replaces one.",
      skills: "Skills",
      experience: "Experience",
    },
    projects: {
      title: "Projects",
      viewCode: "Code",
      viewDemo: "Demo",
      stars: "Stars",
      loading: "Loading projects...",
      error: "Failed to load projects",
    },
    contacts: {
      title: "Contacts",
      subtitle: "Get in touch",
      telegram: "Telegram",
      email: "Email",
      hh: "HeadHunter",
    },
    music: {
      on: "Music on",
      off: "Music off",
    },
    theme: {
      light: "Light theme",
      dark: "Dark theme",
      system: "System",
    },
    zvonok: {
      login: "Sign in with Zvonochek",
      loginShort: "Zvonochek",
      logout: "Sign out",
      signedInAs: "Signed in as",
      failed: "Sign-in failed",
      tooltip: "Zvonochek — my own messenger",
      modalTitle: "Sign in with Zvonochek",
      modalLead:
        "This is OAuth sign-in through Zvonochek — a messenger I built myself.",
      modalBody:
        "It's wired straight into this portfolio as a test: hit “Try it”, sign in with your Zvonochek account, and your profile comes back here — name and avatar. The portfolio gets nothing beyond that.",
      modalTry: "Try it",
      modalAbout: "Open Zvonochek",
      close: "Close",
    },
  },
} as const;

export function t(locale: Locale) {
  return translations[locale];
}
