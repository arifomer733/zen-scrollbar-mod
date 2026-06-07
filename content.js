const STYLE_ID = "zen-scrollbar-mod-style";
const SCROLLBAR_ID = "zen-scrollbar-mod-track";
const THUMB_ID = "zen-scrollbar-mod-thumb";

let scrollTimeout = null;
let isDragging = false;
let dragStartY = 0;
let dragStartScrollTop = 0;
let isEnabled = false;

// ─── CSS: hide native scrollbar ───────────────────────────────────
function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    /* Hide native scrollbar completely */
    html, body, :root, * {
      scrollbar-width: none !important;
    }
    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    /* Overlay scrollbar track */
    #${SCROLLBAR_ID} {
      position: fixed;
      top: 0;
      right: 0;
      width: 14px;
      height: 100vh;
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    #${SCROLLBAR_ID}.visible {
      opacity: 1;
    }

    #${SCROLLBAR_ID}:hover,
    #${SCROLLBAR_ID}.dragging {
      pointer-events: auto;
    }

    #${SCROLLBAR_ID}.visible {
      pointer-events: auto;
    }

    /* Thumb */
    #${THUMB_ID} {
      position: absolute;
      right: 2px;
      width: 2px;
      min-height: 30px;
      border-radius: 10px;
      background: rgba(160, 160, 160, 0.35);
      transition: width 0.2s ease, right 0.2s ease, background 0.2s ease;
      cursor: default;
    }

    /* Hover: expand thumb */
    #${SCROLLBAR_ID}:hover #${THUMB_ID},
    #${SCROLLBAR_ID}.dragging #${THUMB_ID} {
      width: 10px;
      right: 2px;
      background: rgba(160, 160, 160, 0.6);
      cursor: grab;
    }

    #${SCROLLBAR_ID}.dragging #${THUMB_ID} {
      background: rgba(160, 160, 160, 0.8);
      cursor: grabbing;
    }
  `;
    (document.head || document.documentElement).appendChild(style);
}

// ─── Create custom scrollbar elements ─────────────────────────────
function createScrollbar() {
    if (document.getElementById(SCROLLBAR_ID)) return;

    const track = document.createElement("div");
    track.id = SCROLLBAR_ID;

    const thumb = document.createElement("div");
    thumb.id = THUMB_ID;

    track.appendChild(thumb);
    document.documentElement.appendChild(track);

    // ── Update thumb position & size ──
    function updateThumb() {
        const doc = document.documentElement;
        const body = document.body;
        const scrollTop = window.scrollY || doc.scrollTop;
        const scrollHeight = Math.max(
            doc.scrollHeight, body ? body.scrollHeight : 0
        );
        const clientHeight = doc.clientHeight;

        if (scrollHeight <= clientHeight) {
            track.classList.remove("visible");
            return;
        }

        const ratio = clientHeight / scrollHeight;
        const thumbHeight = Math.max(ratio * clientHeight, 30);
        const maxScroll = scrollHeight - clientHeight;
        const thumbTop = (scrollTop / maxScroll) * (clientHeight - thumbHeight);

        thumb.style.height = thumbHeight + "px";
        thumb.style.top = thumbTop + "px";
    }

    // ── Show on scroll, hide after idle ──
    function showScrollbar() {
        updateThumb();
        track.classList.add("visible");
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (!isDragging) {
                track.classList.remove("visible");
            }
        }, 1200);
    }

    // ── Scroll listener ──
    window.addEventListener("scroll", showScrollbar, { passive: true });
    window.addEventListener("resize", updateThumb, { passive: true });

    // ── Click on track to jump ──
    track.addEventListener("mousedown", (e) => {
        if (e.target === thumb) return;
        e.preventDefault();
        const rect = track.getBoundingClientRect();
        const clickRatio = (e.clientY - rect.top) / rect.height;
        const doc = document.documentElement;
        const body = document.body;
        const scrollHeight = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
        const maxScroll = scrollHeight - doc.clientHeight;
        window.scrollTo({ top: clickRatio * maxScroll, behavior: "smooth" });
    });

    // ── Drag the thumb ──
    thumb.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        dragStartY = e.clientY;
        dragStartScrollTop = window.scrollY || document.documentElement.scrollTop;
        track.classList.add("dragging");
        document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const doc = document.documentElement;
        const body = document.body;
        const scrollHeight = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
        const clientHeight = doc.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        const deltaY = e.clientY - dragStartY;
        const ratio = clientHeight / scrollHeight;
        const thumbHeight = Math.max(ratio * clientHeight, 30);
        const scrollDelta = (deltaY / (clientHeight - thumbHeight)) * maxScroll;

        window.scrollTo(0, dragStartScrollTop + scrollDelta);
        updateThumb();
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            track.classList.remove("dragging");
            document.body.style.userSelect = "";
            // Auto-hide after releasing
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                track.classList.remove("visible");
            }, 1200);
        }
    });

    // ── Keep visible while hovering the track ──
    track.addEventListener("mouseenter", () => {
        clearTimeout(scrollTimeout);
        track.classList.add("visible");
    });
    track.addEventListener("mouseleave", () => {
        if (!isDragging) {
            scrollTimeout = setTimeout(() => {
                track.classList.remove("visible");
            }, 800);
        }
    });

    // Initial update
    updateThumb();
}

// ─── Enable / Disable ─────────────────────────────────────────────
function enable() {
    if (isEnabled) return;
    isEnabled = true;
    injectCSS();
    // Wait for DOM to be ready before creating scrollbar elements
    if (document.body) {
        createScrollbar();
    } else {
        document.addEventListener("DOMContentLoaded", createScrollbar, { once: true });
    }
    console.log("Zen Scrollbar Mod: Enabled (overlay mode)");
}

function disable() {
    isEnabled = false;
    const style = document.getElementById(STYLE_ID);
    const track = document.getElementById(SCROLLBAR_ID);
    if (style) style.remove();
    if (track) track.remove();
    clearTimeout(scrollTimeout);
    console.log("Zen Scrollbar Mod: Disabled");
}

// ─── Message listener ─────────────────────────────────────────────
browser.runtime.onMessage.addListener((msg) => {
    if (msg && msg.hasOwnProperty("toggle")) {
        if (msg.toggle) {
            enable();
        } else {
            disable();
        }
    }
});

// ─── Query state on load ──────────────────────────────────────────
browser.runtime.sendMessage({ action: "getState" })
    .then((response) => {
        if (response && response.enabled) {
            enable();
        }
    })
    .catch((err) => {
        console.debug("Zen Scrollbar Mod: state query ignored.", err);
    });