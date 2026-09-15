type PrintScope = "session" | "date";

function clearPartialPrint(): void {
  document.body.classList.remove("print-session-only", "print-date-only");
  document.querySelectorAll(".print-selected").forEach((element) => {
    element.classList.remove("print-selected");
  });
}

export function printAll(): void {
  clearPartialPrint();
  window.print();
}

export function printPartial(scope: PrintScope, element: HTMLElement | null): void {
  if (!element) return;

  clearPartialPrint();
  document.body.classList.add(`print-${scope}-only`);
  element.classList.add("print-selected");

  const cleanup = () => clearPartialPrint();
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}
