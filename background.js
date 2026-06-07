let enabled = true;

// Set initial badge state on load
updateBadge();

browser.browserAction.onClicked.addListener((tab) => {
    enabled = !enabled;
    updateBadge();

    browser.tabs.sendMessage(tab.id, {
        toggle: enabled
    });
});

// Allow content scripts to query the current state on load/reload
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === "getState") {
        sendResponse({ enabled: enabled });
    }
});

function updateBadge() {
    browser.browserAction.setBadgeText({ text: enabled ? "ON" : "OFF" });
    browser.browserAction.setBadgeBackgroundColor({ color: enabled ? "#22c55e" : "#ef4444" });
}