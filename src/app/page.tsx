"use client";

import { Sidebar } from "@/components/sidebar";
import { SectionObserver } from "@/components/section-observer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { HomeSection } from "@/components/sections/home-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactsSection } from "@/components/sections/contacts-section";
import { FooterSection } from "@/components/sections/footer-section";
import { ParticlesBg } from "@/components/particles-bg";
import { Loader } from "@/components/loader";
import { MarginNotes } from "@/components/margin-notes";
import { useApp } from "@/context/app-context";
import { useZvonokAuth } from "@/hooks/use-zvonok-auth";

export default function Page() {
  const { loaded } = useApp();
  // Один вход на страницу: им пользуются и сайдбар, и заметки на полях.
  const zvonok = useZvonokAuth();

  return (
    <>
      <Loader />
      {/* Страница монтируется сразу, а не по `loaded`. Раньше она появлялась
          ровно в тот момент, когда лоадер начинал таять, и въезд героя
          (framer-motion: задержка 0.3s + 0.6s анимации) приходился аккурат на
          эти 700ms затухания — отсюда и дёрганье. Теперь картинка грузится,
          раскладка считается и анимации входа отыгрывают под ещё
          непрозрачным лоадером, а тает он уже над готовым кадром. */}
      <ParticlesBg />
      {/* Lenis — единственное, что ждёт: пока лоадер держит прокрутку
          замороженной, плавному скроллу делать нечего. */}
      {loaded && <SmoothScroll />}
      <SectionObserver />
      <Sidebar auth={zvonok} />
      <MarginNotes auth={zvonok} />
      <main className="pb-16 md:pb-0">
        <HomeSection />
        <AboutSection />
        <ProjectsSection auth={zvonok} />
        <ContactsSection />
        <FooterSection />
      </main>
    </>
  );
}
