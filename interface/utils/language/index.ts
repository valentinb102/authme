import { localeEN } from "@utils/language/en"
import { localeHU } from "@utils/language/hu"
import { localeES } from "@utils/language/es"
import { localeFR } from "@utils/language/fr"
import { localeRU } from "@utils/language/ru"
import { localeDE } from "@utils/language/de"
import { getSettings } from "@stores/settings"

export const getLanguage = () => {
	const language = navigator.language
	const settings = getSettings()

	if (settings.settings.language === 0) {
		if (language.startsWith("hu")) {
			return localeHU
		} else if (language.startsWith("es")) {
			return localeES
		} else if (language.startsWith("fr")) {
			return localeFR
		} else if (language.startsWith("ru")) {
			return localeRU
		} else if (language.startsWith("de")) {
			return localeDE
		} else {
			return localeEN
		}
	} else {
		const languages = [localeEN, localeHU, localeES, localeFR, localeRU, localeDE]

		return languages[settings.settings.language - 1]
	}
}
