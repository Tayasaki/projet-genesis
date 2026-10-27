/**
 * jsdom stubs required by Radix UI primitives (Select, DropdownMenu, Popover,
 * Tooltip, HoverCard, ...). jsdom implements none of these browser APIs:
 *
 * - Element.prototype.hasPointerCapture / setPointerCapture / releasePointerCapture
 *   (Select and DropdownMenu triggers call them on pointer events)
 * - Element.prototype.scrollIntoView (Select scrolls the active item into view)
 * - ResizeObserver (Popper-based content measures its anchor)
 *
 * Call `installRadixJsdomStubs()` at the top of any test file that renders a
 * Radix overlay. It is idempotent and never overrides an API jsdom (or an
 * earlier call) already provides. It is deliberately NOT in vitest.setup.ts so
 * that only the tests needing it opt in.
 */
export function installRadixJsdomStubs(): void {
  const proto = Element.prototype as unknown as Record<string, unknown>;

  if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
  if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
  if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
  if (!proto.scrollIntoView) proto.scrollIntoView = () => {};

  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as Record<string, unknown>).ResizeObserver =
      ResizeObserverStub;
  }
}
