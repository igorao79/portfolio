"use client";

import Image from "next/image";
import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { RotatingText } from "@/components/ui/rotating-text";
import { Github } from "lucide-react";
import { SparklesText, Marquee } from "@igorao79/uivix";

export function HomeSection() {
  const { locale } = useApp();
  const tr = t(locale);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-12"
    >
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:gap-12 lg:gap-16">
        {/* Large B&W photo */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[480px]"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src="/igor.webp"
              alt="Igor"
              width={480}
              height={600}
              className="h-auto w-full object-cover grayscale"
              priority
              unoptimized
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />

            {/* GitHub logo badge */}
            <a
              href="https://github.com/igorao79"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 bg-white/80 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 sm:bottom-4 sm:right-4 sm:h-12 sm:w-12"
            >
              <Image
                src="/igorlogo.webp"
                alt="GitHub"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </a>
          </div>

        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center md:text-left"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-base">
            {tr.home.role}
          </p>
          {/* Имя, а следом — ник на GitHub ссылкой: «Игорь / ⃝ igorao79».
              Обычный инлайн-поток, а не flex: так слеш и ник садятся на одну
              базовую линию с именем, а не по центру его высоты. */}
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:mt-3 sm:text-5xl md:text-6xl lg:text-7xl">
            <SparklesText
              sparkleColor="currentColor"
              count={6}
              minSize={8}
              maxSize={18}
              speed={500}
              className="font-heading"
            >
              {tr.home.name}
            </SparklesText>
            {/* Слеш и ник — одной неразрывной группой: в полный размер имени
                строка влезает не всегда, и переноситься они должны вместе, а
                не оставлять слеш или иконку висеть в конце предыдущей. */}
            <span className="whitespace-nowrap">
              <span aria-hidden="true" className="mx-[0.15em] align-baseline font-light">
                /
              </span>
              {/* Без своего text-* — размер наследуется от h1, то есть ровно
                  как у имени. Иконка в em, чтобы расти вместе с ним. */}
              <a
                href="https://github.com/igorao79"
                target="_blank"
                rel="noopener noreferrer"
                className="align-baseline font-sans font-semibold tracking-normal text-foreground transition-opacity hover:opacity-60"
              >
                <Github className="mr-[0.2em] inline-block h-[0.72em] w-[0.72em] align-baseline" />
                igorao79
              </a>
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            {tr.home.descriptionPrefix}{" "}
            <RotatingText
              texts={tr.home.descriptionRotating as unknown as string[]}
              className="font-semibold text-foreground"
              rotationInterval={2500}
              staggerDuration={0.03}
            />{" "}
            {tr.home.descriptionSuffix}
          </p>
        </motion.div>
      </div>

      {/* Tech marquee at bottom */}
      <div className="absolute inset-x-0 bottom-8 opacity-30 sm:bottom-12">
        <Marquee speed={40} pauseOnHover fade>
          {["React", "Next.js", "TypeScript", "Node.js", "Python", "Tailwind CSS", "PostgreSQL", "Docker", "Git", "Claude Code", "Cursor"].map((tech) => (
            <span key={tech} className="mx-6 text-sm font-medium tracking-wider text-muted-foreground sm:mx-8 sm:text-base">
              {tech}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
