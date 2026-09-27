export const scrollIntoViewCenter = (el: HTMLElement | null | undefined) => {
  el?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
};
