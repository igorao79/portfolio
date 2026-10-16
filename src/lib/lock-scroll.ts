/**
 * Замораживает прокрутку страницы, пока открыта модалка, и возвращает
 * функцию, которая всё отпускает обратно.
 *
 * Одного `overflow: hidden` на body мало: Lenis крутит страницу сам, по
 * собственному обработчику колеса, и про overflow ничего не знает — колесо
 * над модалкой продолжало бы листать фон. Поэтому его ещё и останавливаем.
 * Контейнеру со своим скроллом нужен атрибут `data-lenis-prevent`, иначе
 * Lenis перехватит колесо и внутри модалки.
 */
export function lockPageScroll(): () => void {
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis;
  lenis?.stop();

  return () => {
    document.body.style.overflow = prevOverflow;
    lenis?.start();
  };
}
