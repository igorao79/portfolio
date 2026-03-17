"use client";

import { Sidebar } from "@/components/sidebar";
import { SectionObserver } from "@/components/section-observer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { HomeSection } from "@/components/sections/home-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactsSection } from "@/components/sections/contacts-section";
import { ParticlesBg } from "@/components/particles-bg";
import { Loader } from "@/components/loader";
import { useApp } from "@/context/app-context";

export default function Page() {
  const { loaded } = useApp();

  return (
    <>
      <Loader />
      {loaded && (
        <>
          <ParticlesBg />
          <SmoothScroll />
          <SectionObserver />
          <Sidebar />
          <main className="pb-16 md:pb-0">
            <HomeSection />
            <AboutSection />
            <ProjectsSection />
            <ContactsSection />
          </main>
        </>
      )}
    </>
  );
}
