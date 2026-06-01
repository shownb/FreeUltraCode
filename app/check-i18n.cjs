const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// Find the UI_FULL section
const uiFullStart = content.indexOf('const UI_FULL = {');
const uiFullEnd = content.indexOf('} as const;', uiFullStart);
const uiFullSection = content.slice(uiFullStart, uiFullEnd + 1);

const locales = ['zh-CN', 'en-US', 'es-ES', 'fr-FR', 'ru-RU', 'ar-SA', 'hi-IN', 'ja-JP', 'pt-PT', 'de-DE'];
const keysByLocale = {};

for (const locale of locales) {
  const startMarker = "  '" + locale + "': {";
  const startIdx = uiFullSection.indexOf(startMarker);
  if (startIdx === -1) {
    console.log('Could not find start for ' + locale);
    continue;
  }

  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let endIdx = -1;

  for (let i = startIdx + startMarker.length - 1; i < uiFullSection.length; i++) {
    const char = uiFullSection[i];

    if (inString) {
      if (char === '\\' && i + 1 < uiFullSection.length) {
        i++;
      } else if (char === stringChar) {
        inString = false;
      }
    } else {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx === -1) {
    console.log('Could not find end for ' + locale);
    continue;
  }

  const section = uiFullSection.slice(startIdx, endIdx + 1);
  // Match keys like 'common.cancel': or 'settings.tabs.general':
  const keys = [...section.matchAll(/\n\s+'([\w.]+)'\s*:/g)].map(m => m[1]);
  keysByLocale[locale] = keys;
  console.log(locale + ': ' + keys.length + ' keys');
}

const zhKeys = new Set(keysByLocale['zh-CN'] || []);
for (const locale of locales) {
  if (locale === 'zh-CN') continue;
  const localeKeys = new Set(keysByLocale[locale] || []);
  const missing = [...zhKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !zhKeys.has(k));
  if (missing.length > 0 || extra.length > 0) {
    console.log('\n=== ' + locale + ' ===');
    if (missing.length > 0) {
      console.log('Missing (' + missing.length + '):');
      missing.forEach(k => console.log('  - ' + k));
    }
    if (extra.length > 0) {
      console.log('Extra (' + extra.length + '):');
      extra.forEach(k => console.log('  + ' + k));
    }
  } else {
    console.log(locale + ': OK (same ' + localeKeys.size + ' keys as zh-CN)');
  }
}
