# Localization

So2alGawab supports Arabic (default) and English using **i18next** + **react-i18next** with bundled JSON resources.

---

## Directory structure

```
src/localization/
├── i18n.ts              # i18next initialization and language helpers
├── languageStore.ts     # Zustand store for language + isRTL state
├── useLocale.ts         # Convenience hook with RTL utilities
└── locales/
    ├── ar/              # Arabic translations (default language)
    │   ├── common.json
    │   ├── settings.json
    │   ├── errors.json
    │   ├── setup.json
    │   ├── game.json
    │   └── tv.json
    └── en/              # English translations
        └── (mirrors ar/ structure)
```

---

## Namespaces

Each namespace covers one feature domain. Keep namespaces small and focused — split rather than grow.

| Namespace  | Purpose                                        |
|------------|------------------------------------------------|
| `common`   | Shared UI labels used across multiple features |
| `settings` | Language switcher and preferences screen       |
| `errors`   | User-facing error messages                     |
| `setup`    | Game setup / lobby screen                      |
| `game`     | Active gameplay UI                             |
| `tv`       | TV second-screen (lobby, cast, game display)   |

---

## Key naming conventions

- **snake_case** for all keys: `tap_to_play`, `code_label`
- **Namespaced dotted paths** match the feature section: `session_modal.title`, `cast.errors.device_not_found`
- **Interpolation** uses double braces: `"remaining": "باقي {{count}} لعبة"`
- **Arrays** for ordered lists (steps, numbered items): `"steps": ["step one", "step two"]`
- **Cross-namespace references** use the `ns:key` syntax: `t('common:retry')`

---

## Using translations in components

### Single namespace

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('game');
t('audio.tap_to_play')           // → "اضغط للتشغيل"
t('question_card.points', { points: 200 })  // → "200 نقطة"
```

### Multiple namespaces

```typescript
const { t } = useTranslation(['tv', 'common']);
t('tv:session_modal.title')      // explicit namespace prefix
t('common:retry')
```

### Arrays (returnObjects)

```typescript
const steps = t('lobby.steps', { returnObjects: true }) as unknown as string[];
```

### RTL-aware layout via `useLocale`

```typescript
import { useLocale } from '../../../localization/useLocale';

const { isRTL, textAlign, rowLTR } = useLocale('setup');
// textAlign: 'right' in AR, 'left' in EN
// rowLTR: flexDirection that keeps items in visual left-to-right order regardless of language
```

---

## Adding a new translation key

1. Add the key to `locales/ar/<namespace>.json`
2. Add the same key (with English text) to `locales/en/<namespace>.json`
3. Use `t('namespace:key')` in the component

Missing keys in development emit a `console.warn` via `missingKeyHandler` in `i18n.ts`.

---

## Adding a new language

1. Create `locales/<code>/` and mirror all six JSON files
2. Add `<code>` to `SUPPORTED_LANGUAGES` in `i18n.ts`
3. Add the locale resources to the `i18n.init({ resources })` block
4. Add a flag + name entry to `LanguageSwitcher.tsx`
5. Decide whether the language is RTL in `languageStore.ts` → `setLanguage`

---

## Language persistence

- Language preference is stored in `AsyncStorage` under key `@so2algawab_language`
- On first launch, `loadStoredLanguage()` falls back to the device locale, then to Arabic
- `App.tsx` calls `loadStoredLanguage()` before rendering to prevent a language flash

---

## RTL behaviour

| Platform | How direction is applied                             |
|----------|------------------------------------------------------|
| Native   | `I18nManager.forceRTL()` — takes effect on next app launch |
| Web      | `document.documentElement.dir` — takes effect immediately  |

The `isRTL` flag in `useLanguageStore` updates immediately and drives all layout logic in components (flex direction, text alignment). Text translations always hot-swap; native layout direction requires a restart.

---

## Lokalise compatibility

The JSON structure is Lokalise-compatible. Keys use dot-notation in the file path (`namespace.section.key`) which maps to nested JSON objects. To import/export:

- **Export**: upload each `locales/<lang>/<namespace>.json` as a separate file
- **Import**: replace the JSON files and re-bundle; no code changes needed
