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
      bio: "Я fullstack-разработчик с опытом создания веб-приложений. Специализируюсь на React, Next.js, TypeScript и Node.js. Увлечён чистым кодом, производительностью и созданием интуитивных пользовательских интерфейсов.",
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
      bio: "I'm a fullstack developer with experience building web applications. I specialize in React, Next.js, TypeScript, and Node.js. Passionate about clean code, performance, and creating intuitive user interfaces.",
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
  },
} as const;

export function t(locale: Locale) {
  return translations[locale];
}
