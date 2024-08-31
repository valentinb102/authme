import build from "../../../build.json"
import { path, invoke, os, dialog, app, process, clipboard, window } from "@tauri-apps/api"
import { UAParser } from "ua-parser-js"
import { navigate, open } from "../../utils/navigate"
import { deleteEncryptionKey } from "interface/utils/encryption"
import { getSettings, setSettings } from "interface/stores/settings"

const settings = getSettings()

export interface SystemInfo {
	osName: string
	osArch: string
	cpuName: string
	totalMem: number
}

export const about = async () => {
	const tauriVersion = await app.getTauriVersion()
	const osVersion = await os.version()
	const browser = new UAParser().getBrowser()

	// Browser version
	const browserName = browser.name.replace("Edge", "Chromium").replace("Safari", "WebKit")
	const browserVersion = browser.version

	// System info
	const systemInfo: SystemInfo = await invoke("system_info")

	const cpu = systemInfo.cpuName
		.split("@")[0]
		.replaceAll("(R)", "")
		.replaceAll("(TM)", "")
		.replace(/ +(?= )/g, "")
	const memory = `${Math.round(systemInfo.totalMem / 1024 / 1024 / 1024)} GB`
	const osName = systemInfo.osName
	const osArch = systemInfo.osArch

	const info = `Authme: ${build.version} \n\nTauri: ${tauriVersion}\n${browserName}: ${browserVersion}\n\nOS version: ${osName} ${osArch} ${osVersion}\nHardware info: ${cpu} ${memory} RAM\n\nRelease date: ${build.date}\nBuild number: ${build.number}\n\nCreated by: Lőrik Levente`

	const res = await dialog.confirm(info, { cancelLabel: "Close", okLabel: "Copy" })

	if (res) {
		clipboard.writeText(info)
	}
}

/**
 * Delete selected data
 */
export const clearData = async (clearCodesOption: boolean, clearSettingsOption: boolean) => {
	const dialogClearData: LibDialogElement = document.querySelector(".dialogClearData")

	// clear codes
	if (clearCodesOption && !clearSettingsOption) {
		const confirm0 = await dialog.ask("Are you sure you want to clear 2FA codes? \n\nThis cannot be undone!", { type: "warning" })

		if (confirm0 === false) {
			return
		}

		settings.vault.codes = null
		setSettings(settings)

		dialogClearData.close()
		navigate("codes")
	}

	// clear settings
	if (!clearCodesOption && clearSettingsOption) {
		const confirm0 = await dialog.ask("Are you sure you want to clear all settings? \n\nThis cannot be undone!", { type: "warning" })

		if (confirm0 === false) {
			return
		}

		settings.settings.language = 0
		settings.settings.launchOnStartup = true
		settings.settings.minimizeToTray = true
		settings.settings.optionalAnalytics = true
		settings.settings.codesDescription = false
		settings.settings.blurCodes = false
		settings.settings.sortCodes = 0
		settings.settings.codesLayout = 0
		setSettings(settings)

		dialogClearData.close()
		navigate("settings")
	}

	// clear everything
	if (clearCodesOption && clearSettingsOption) {
		const confirm0 = await dialog.ask("Are you sure you want to clear all data? \n\nThis cannot be undone!", { type: "warning" })

		if (confirm0 === false) {
			return
		}

		const confirm1 = await dialog.ask("Are you absolutely sure? \n\nThere is no way back!", { type: "warning" })

		if (confirm1 === true) {
			localStorage.clear()
			sessionStorage.clear()

			await deleteEncryptionKey("encryptionKey")

			if (build.dev === false) {
				await invoke("disable_auto_launch")
				process.exit()
			} else {
				navigate("/")
				location.reload()
			}
		}
	}
}

/**
 * Show Clear data dialog
 */
export const showClearDataDialog = () => {
	const dialogClearData: LibDialogElement = document.querySelector(".dialogClearData")
	const closeDialog = document.querySelector(".dialogClearDataClose")

	closeDialog.addEventListener("click", () => {
		dialogClearData.close()
	})

	dialogClearData.showModal()
}

/**
 * Delete all imported codes
 */
export const deleteCodes = async () => {
	settings.vault.codes = null
	setSettings(settings)

	navigate("codes")
}

export const showLogs = async () => {
	const folderPath = await path.join(await path.cacheDir(), "com.levminer.authme", "logs")
	open(folderPath)
}

export const launchOnStartup = () => {
	if (settings.settings.launchOnStartup === true) {
		invoke("disable_auto_launch")
	} else {
		invoke("enable_auto_launch")
	}
}

export const toggleWindowCapture = (windowCapture: boolean) => {
	window.appWindow.setContentProtected(windowCapture)
}
