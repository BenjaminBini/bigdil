import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n'

const LANG_LABEL: Record<SupportedLanguage, string> = {
  fr: 'Français',
  en: 'English',
}

const LANG_SHORT: Record<SupportedLanguage, string> = {
  fr: 'FR',
  en: 'EN',
}

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'fr').slice(0, 2) as SupportedLanguage
  const safeCurrent: SupportedLanguage = SUPPORTED_LANGUAGES.includes(current) ? current : 'fr'

  function switchTo(lang: SupportedLanguage) {
    if (lang === safeCurrent) return
    void i18n.changeLanguage(lang)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2"
          aria-label="Change language"
        >
          <Languages className="size-4" />
          <span className="text-xs font-semibold tabular-nums">{LANG_SHORT[safeCurrent]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onSelect={() => switchTo(lang)}
            className="flex items-center justify-between"
          >
            <span>{LANG_LABEL[lang]}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {LANG_SHORT[lang]}
              {lang === safeCurrent && ' •'}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
