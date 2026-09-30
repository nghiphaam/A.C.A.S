import { beggingFloaty, userStatElements } from './elementDeclarations.js';

const getStorageKey = key => USER_USAGE_PREFIX + key;

function showBeggingFloaty(minutes) {
    const hoursText = beggingFloaty?.querySelector('b');
    if(!hoursText) return;

    hoursText.innerText = Math.round(minutes / 60);

    beggingFloaty.showModal();
}

function saveUserUsageStat(key, value) {
    localStorage.setItem(getStorageKey(key), value);

    if(key === MINUTES_USED_STORAGE_KEY && (value % 1440 === 0)) {
        showBeggingFloaty(value);
    }

    updateUserUsageStats(key, value);
}

export function incrementUserUsageStat(key, amount = 1) {
    const existing = getUserUsageStat(key);

    let newValue = amount;

    if(existing && !isNaN(existing.value)) {
        newValue = existing.value + amount;
    }

    saveUserUsageStat(key, newValue);
    return newValue;
}

function getUserUsageStat(key) {
    const val = localStorage.getItem(getStorageKey(key));
    if(val === null) return null;

    return {
        key,
        value: Number(val)
    };
}

function getAllUserUsageStats() {
    const stats = [];
    const storageKeys = Object.keys(localStorage);

    for(let i = 0; i < storageKeys.length; i++) {
        const storageKey = storageKeys[i];

        if(storageKey.startsWith(USER_USAGE_PREFIX)) {
            const cleanKey = storageKey.replace(USER_USAGE_PREFIX, '');
            const stat = getUserUsageStat(cleanKey);
            if(stat) stats.push(stat);
        }
    }

    return stats;
}

export function updateUserUsageStats(key = null, value = null) {
    userStatElements.forEach(elem => {
        const elemKey = elem.dataset.key;

        if(key && elemKey !== key) return;

        const valueEl = elem.querySelector('p');
        if(!valueEl) return;

        const statValue = value !== null
            ? value
            : (getUserUsageStat(elemKey)?.value ?? 0);

        valueEl.textContent = FI_NUMBER_FORMATTER.format(statValue);
    });
}
