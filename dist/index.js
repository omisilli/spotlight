/*
 * spotlight — a large logo lit by the pointer: dim, grainy, and bright in
 * a soft circle around the cursor; or dark until the pointer finds it.
 *
 *   <div data-pg-spotlight data-pg-spotlight-grain>
 *       <svg viewBox="…">…</svg>
 *   </div>
 *
 * The logo: the box's first element — an <svg> (paths, or <text> in a web
 * font), an <img>, or plain text. It is written once. This script copies it for the lit layer —
 * laid over the dim one, shown only in a circle around the pointer — and
 * moves the circle with the pointer, and with the page when it scrolls
 * under a still pointer (Lenis or not).
 *
 *   data-pg-spotlight          on the box around the logo's <svg>
 *   data-pg-spotlight-grain    a grainy, filmic texture on an SVG's shapes
 *   data-pg-spotlight-touch    shown on touch screens too — where there is
 *                              no pointer, so no light; hidden there unless
 *                              this is set
 *
 * Written by this script:
 *   data-pg-spotlight-lit      on the copy
 *   data-pg-spotlight-active   on the box: "true" while a mouse is on the
 *                              page, "false" when it has left, or on touch
 *   --pg-spotlight-x / -y      on the box: the pointer, from its top left
 *
 * How bright, how big — CSS variables, in index.css.
 */
const ATTR = "data-pg-spotlight";
const LIT = "data-pg-spotlight-lit";
const ACTIVE = "data-pg-spotlight-active";
const GRAIN_ID = "pg-spotlight-grain";
/* The grain, once per page, for every spotlight: fine noise that the
   shapes are cut from (index.css applies it). */
function addGrain() {
    if (document.getElementById(GRAIN_ID))
        return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML =
        `<filter id="${GRAIN_ID}">` +
            `<feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="4" result="noise"/>` +
            `<feComposite in="SourceGraphic" in2="noise" operator="in"/>` +
            `</filter>`;
    document.body.append(svg);
}
/* The box's own logo: its first element that is not our copy. */
const logoOf = (box) => box.querySelector(`:scope > :not([${LIT}])`);
/* The lit copy: the same drawing, hidden from screen readers, its ids
   dropped — a gradient or a clip it refers to is found in the original. */
function addLit(box) {
    const old = box.querySelector(`:scope > [${LIT}]`);
    if (old)
        return old;
    const logo = logoOf(box);
    if (!logo)
        return null;
    const lit = logo.cloneNode(true);
    lit.removeAttribute("id");
    lit.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    lit.setAttribute(LIT, "");
    lit.setAttribute("aria-hidden", "true");
    lit.removeAttribute("aria-label");
    lit.removeAttribute("role");
    // An image's alt is the logo's name: said once, by the logo.
    if (lit instanceof HTMLImageElement)
        lit.alt = "";
    logo.after(lit);
    return lit;
}
/* Only the newest call answers — a late cleanup from an older one (React
   remounting) cannot switch it off. Same rule as the other packages. */
let live = null;
/* Light every data-pg-spotlight on the page, and any rendered later.
   Returns the cleanup, for a React effect. */
export function initSpotlight() {
    if (typeof document === "undefined")
        return () => { };
    const self = {};
    live = self;
    addGrain();
    // The pointer, in the window's coordinates, and whether a mouse is on
    // the page at all.
    let x = 0;
    let y = 0;
    let active = false;
    let frame = 0;
    const setActive = (on) => {
        if (on === active)
            return;
        active = on;
        for (const box of boxes)
            box.setAttribute(ACTIVE, String(on));
    };
    // Each box gets the pointer from its own top left — once a frame,
    // however many moves and scrolls came in.
    const draw = () => {
        frame = 0;
        if (!active)
            return;
        for (const box of seen) {
            const r = box.getBoundingClientRect();
            box.style.setProperty("--pg-spotlight-x", `${Math.round(x - r.left)}px`);
            box.style.setProperty("--pg-spotlight-y", `${Math.round(y - r.top)}px`);
        }
    };
    const schedule = () => {
        if (!frame)
            frame = requestAnimationFrame(draw);
    };
    const boxes = new Set();
    const made = new Set();
    // The ones on screen: only those follow the pointer.
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            const box = e.target;
            if (e.isIntersecting)
                seen.add(box);
            else
                seen.delete(box);
        }
        schedule();
    });
    const take = (box) => {
        if (boxes.has(box))
            return;
        const had = box.querySelector(`:scope > [${LIT}]`);
        const lit = addLit(box);
        if (!lit)
            return;
        if (!had)
            made.add(lit);
        boxes.add(box);
        box.setAttribute(ACTIVE, String(active));
        io.observe(box);
    };
    const scan = (root) => {
        if (root instanceof HTMLElement && root.hasAttribute(ATTR))
            take(root);
        root.querySelectorAll(`[${ATTR}]`).forEach(take);
    };
    scan(document);
    // Rendered later — another route, a section loaded on demand.
    const mo = new MutationObserver((records) => {
        for (const r of records) {
            r.addedNodes.forEach((n) => {
                if (n instanceof Element)
                    scan(n);
            });
            r.removedNodes.forEach((n) => {
                if (!(n instanceof Element))
                    return;
                for (const box of boxes) {
                    if (n === box || n.contains(box)) {
                        boxes.delete(box);
                        seen.delete(box);
                        io.unobserve(box);
                    }
                }
            });
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    const onMove = (e) => {
        if (live !== self)
            return;
        // A finger has no "over": the light is for a mouse or a pen.
        if (e.pointerType === "touch")
            return setActive(false);
        x = e.clientX;
        y = e.clientY;
        setActive(true);
        schedule();
    };
    // Off the page: the light goes out.
    const onOut = (e) => {
        if (live === self && !e.relatedTarget)
            setActive(false);
    };
    // The page moves under a still pointer: the light stays on it.
    const onScroll = () => {
        if (live === self && active)
            schedule();
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    addEventListener("scroll", onScroll, { passive: true, capture: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerdown", onMove);
        document.removeEventListener("mouseout", onOut);
        removeEventListener("scroll", onScroll, { capture: true });
        removeEventListener("resize", onScroll);
        cancelAnimationFrame(frame);
        mo.disconnect();
        io.disconnect();
        for (const lit of made)
            lit.remove();
        for (const box of boxes) {
            box.removeAttribute(ACTIVE);
            box.style.removeProperty("--pg-spotlight-x");
            box.style.removeProperty("--pg-spotlight-y");
        }
        if (live === self)
            live = null;
    };
}
