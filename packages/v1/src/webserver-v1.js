const source = new EventSource("/events");

source.addEventListener('log', function (e) {
    const log = document.getElementById("log");
    let log_prefs = [
        ["\u001b[1;31m", 'e'],
        ["\u001b[0;33m", 'w'],
        ["\u001b[0;32m", 'i'],
        ["\u001b[0;35m", 'c'],
        ["\u001b[0;36m", 'd'],
        ["\u001b[0;37m", 'v'],
        ];

    let klass = '';
    let colorPrefix = '';
    for (const log_pref of log_prefs){
        if (e.data.startsWith(log_pref[0])) {
            klass = log_pref[1];
            colorPrefix = log_pref[0];
        }
    }

    if (klass == ''){
        log.innerHTML += e.data + '\n';
        return;
    }

    // Extract content without color codes and ANSI termination
    const content = e.data.substr(7, e.data.length - 11);

    // Split by newlines to handle multi-line messages
    const lines = content.split('\n');

    // Extract header from first line (everything up to and including ']:')
    let header = '';
    const headerMatch = lines[0].match(/^(.*?\]:)/);
    if (headerMatch) {
        header = headerMatch[1];
    }

    // Process each line
    lines.forEach((line, index) => {
        if (line) {
            if (index === 0) {
                // First line - display as-is
                log.innerHTML += '<span class="' + klass + '">' + line + "</span>\n";
            } else {
                // Continuation lines - prepend with header
                log.innerHTML += '<span class="' + klass + '">' + header + line + "</span>\n";
            }
        }
    });
});

actions = [
    ["switch", ["toggle"]],
    ["light", ["toggle"]],
    ["fan", ["toggle"]],
    ["cover", ["open", "close"]],
    ["button", ["press"]],
    ["lock", ["lock", "unlock", "open"]],
    ];
multi_actions = [
    ["select", "option"],
    ["number", "value"],
    ];

source.addEventListener('state', function (e) {
    const data = JSON.parse(e.data);
    // Prefer name_id (new format) over id (legacy format) for entity identification
    // New firmware sends name_id as "domain/name" or "domain/device/name"
    // Legacy format in id is "domain-object_id"
    const entityId = data.name_id || data.id;
    // Try getElementById first (works for old format), then query by data attributes
    let row = document.getElementById(entityId);
    if (!row && entityId.includes('/')) {
        // New format: parse and find by data attributes
        const parts = entityId.split('/');
        const domain = parts[0];
        if (parts.length === 3) {
            // domain/device/name
            const device = CSS.escape(parts[1]);
            const name = CSS.escape(parts[2]);
            row = document.querySelector(`tr[data-domain="${domain}"][data-device="${device}"][data-name="${name}"]`);
        } else {
            // domain/name
            const name = CSS.escape(parts[1]);
            row = document.querySelector(`tr[data-domain="${domain}"][data-name="${name}"]:not([data-device])`);
        }
    }
    if (row && data.state !== undefined) {
        row.children[1].innerText = data.state;
    }
});

// Build URL path for entity
// New firmware: uses data attributes -> /{domain}/{device?}/{name}/{action}
// Old firmware: parses from id attribute -> /{domain}/{object_id}/{action}
function buildEntityUrl(row, action) {
    // Check for new firmware (has data-domain attribute)
    if (row.dataset.domain) {
        const domain = row.dataset.domain;
        const name = encodeURIComponent(row.dataset.name);
        const device = row.dataset.device;
        if (device) {
            return '/' + domain + '/' + encodeURIComponent(device) + '/' + name + '/' + action;
        }
        return '/' + domain + '/' + name + '/' + action;
    }
    // Fall back to old format: id is "domain-object_id"
    const parts = row.id.split('-');
    const domain = parts[0];
    const objectId = parts.slice(1).join('-');
    return '/' + domain + '/' + objectId + '/' + action;
}

const states = document.getElementById("states");
for (let i = 0; i < states.rows.length; i++) {
    const row = states.rows[i];  // Block-scoped copy for closure
    if (!row.children[2].children.length) {
        continue;
    }

    for (const domain of actions){
        if (row.classList.contains(domain[0])) {
            for (let j=0;j<row.children[2].children.length && j < domain[1].length; j++){
                const action = domain[1][j];  // Block-scoped copy for closure
                row.children[2].children[j].addEventListener('click', function () {
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", buildEntityUrl(row, action), true);
                    xhr.send();
                });
            }
        }
    }
    for (const domain of multi_actions){
        if (row.classList.contains(domain[0])) {
            const field = domain[1];  // Block-scoped copy for closure
            row.children[2].children[0].addEventListener('change', function () {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", buildEntityUrl(row, 'set') + '?' + field + '=' + encodeURIComponent(this.value), true);
                xhr.send();
            });
        }
    }
}