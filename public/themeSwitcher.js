const HSThemeAppearance = {
    init() {
        const defaultTheme = 'dark'

        // Prefer the canonical 'theme' key if present (values: 'dark'|'light'|absent)
        // Fallback to legacy 'hs_theme' when 'theme' is not set.
        let theme = localStorage.getItem('theme')
        if (!theme) {
            const hs = localStorage.getItem('hs_theme')
            // map hs_theme values to canonical ones
            if (hs === 'dark') theme = 'dark'
            else if (hs === 'default') theme = 'light'
            else if (hs === 'auto') theme = null
            else theme = defaultTheme
        }

        if (document.querySelector('html').classList.contains('dark')) return
        this.setAppearance(theme)
    },
    _resetStylesOnLoad() {
        const $resetStyles = document.createElement('style')
        $resetStyles.innerText = `*{transition: unset !important;}`
        $resetStyles.setAttribute('data-hs-appearance-onload-styles', '')
        document.head.appendChild($resetStyles)
        return $resetStyles
    },
    setAppearance(theme, saveInStore = true, dispatchEvent = true) {
        const $resetStylesEl = this._resetStylesOnLoad()

        if (saveInStore) {
            // Write both canonical and legacy keys so other scripts remain compatible
            if (theme === 'dark') {
                localStorage.setItem('theme', 'dark')
                localStorage.setItem('hs_theme', 'dark')
            } else if (theme === 'light' || theme === 'default') {
                localStorage.setItem('theme', 'light')
                localStorage.setItem('hs_theme', 'default')
            } else if (theme === 'auto') {
                // For auto, prefer removing canonical key so other scripts can detect
                localStorage.removeItem('theme')
                localStorage.setItem('hs_theme', 'auto')
            } else {
                // fallback
                localStorage.setItem('hs_theme', theme)
            }
        }

        if (theme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
        }

        document.querySelector('html').classList.remove('dark')
        document.querySelector('html').classList.remove('default')
        document.querySelector('html').classList.remove('auto')

        // Add 'dark' or remove it depending on computed theme
        if (this.getOriginalAppearance() === 'dark' || theme === 'dark') {
            document.querySelector('html').classList.add('dark')
        } else {
            document.querySelector('html').classList.remove('dark')
        }

        setTimeout(() => {
            $resetStylesEl.remove()
        })

        if (dispatchEvent) {
            window.dispatchEvent(new CustomEvent('on-hs-appearance-change', {detail: theme}))
        }
    },
    getAppearance() {
        let theme = this.getOriginalAppearance()
        if (theme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
        }
        return theme
    },
    getOriginalAppearance() {
        const defaultTheme = 'default'
        return localStorage.getItem('hs_theme') || defaultTheme
    }
}
HSThemeAppearance.init()

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (HSThemeAppearance.getOriginalAppearance() === 'auto') {
        HSThemeAppearance.setAppearance('auto', false)
    }
})

window.addEventListener('load', () => {
    const $clickableThemes = document.querySelectorAll('[data-hs-theme-click-value]')
    const $switchableThemes = document.querySelectorAll('[data-hs-theme-switch]')

    $clickableThemes.forEach($item => {
        $item.addEventListener('click', () => HSThemeAppearance.setAppearance($item.getAttribute('data-hs-theme-click-value'), true, $item))
    })

    $switchableThemes.forEach($item => {
        $item.addEventListener('change', (e) => {
            HSThemeAppearance.setAppearance(e.target.checked ? 'dark' : 'default')
        })

        $item.checked = HSThemeAppearance.getAppearance() === 'dark'
    })

    window.addEventListener('on-hs-appearance-change', e => {
        $switchableThemes.forEach($item => {
            $item.checked = e.detail === 'dark'
        })
    })
})