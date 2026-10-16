/**
 * Замораживает прокрутку страницы и возвращает функцию, которая всё
 * отпускает обратно.
 *
 * Никакого overflow: у html стоит `overflow-y: scroll`, которым держится
 * место под полосу прокрутки, и стоит запереть его в hidden — полоса
 * исчезает, освободившиеся пиксели уходят контенту, и страница прыгает
 * вбок. Ровно то, от чего мы уходили. Замок у body тут не поможет с другой
 * стороны: пока html не `visible`, его overflow на вьюпорт уже не всплывает.
 *
 * Поэтому запираем не раскладку, а ввод:
 *  - Lenis крутит страницу своим обработчиком колеса, так что его
 *    останавливаем (во время лоадера его ещё нет — тогда работает
 *    перехват ниже);
 *  - колесо и тач гасим сами, пропуская всё, что лежит внутри
 *    `[data-lenis-prevent]` — это контейнеры со своим скроллом;
 *  - клавиши прокрутки Lenis не трогает вовсе, добираем их отдельно.
 */
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

export function lockPageScroll(): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis;
  lenis?.stop();

  const isOwnScroller = (target: EventTarget | null) =>
    target instanceof Element && target.closest("[data-lenis-prevent]") !== null;

  const blockScroll = (e: Event) => {
    if (!isOwnScroller(e.target)) e.preventDefault();
  };

  const blockKeys = (e: KeyboardEvent) => {
    const target = e.target as Element | null;
    // Пробел и стрелки в полях ввода — это ввод, а не прокрутка.
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (isOwnScroller(target)) return;
    if (SCROLL_KEYS.has(e.key)) e.preventDefault();
  };

  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockKeys);

  return () => {
    lenis?.start();
    window.removeEventListener("wheel", blockScroll);
    window.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", blockKeys);
  };
}
