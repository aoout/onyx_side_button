import { MarkdownView, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, OnyxSideButtonSettings } from "./settings/settings";
import { OnyxSideButtonSettingsTab } from "./settings/settingsTab";

export default class OnyxSideButton extends Plugin {
	settings: OnyxSideButtonSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new OnyxSideButtonSettingsTab(this.app, this));
		this.registerEvent(
			this.app.workspace.on("file-open", (_) => {
				document.onkeydown = (evt) => {
					evt.preventDefault();
					this.flip(evt.key == "pageUp" ? "up" : "down");
				};
			})
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	flip(mode: string) {
		const thisView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// @ts-ignore
		const thisScrollObj = thisView?.previewMode?.renderer?.previewEl;
		const range = thisScrollObj?.clientHeight - this.settings.flipingBias;
		thisScrollObj?.scrollBy(0, mode === "up" ? -range : range);
	}
}
