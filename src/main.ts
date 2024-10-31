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
				let lastKeyDownTime = 0;
				let lastKeyDownKey = "";
				document.onkeydown = (evt) => {
					evt.preventDefault();
					const currentTime = new Date().getTime();
					if (currentTime - lastKeyDownTime < 1000 && lastKeyDownKey === evt.key) {
						this.flip(evt.key == "PageUp" ? "top" : "bottom");
					} else {
						this.flip(evt.key == "PageUp" ? "up" : "down");
					}
					lastKeyDownTime = currentTime;
					lastKeyDownKey = evt.key;
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
		switch (mode) {
		case "up":
			thisScrollObj?.scrollBy(0, -range);
			break;
		case "down":
			thisScrollObj?.scrollBy(0, range);
			break;
		case "top":
			thisScrollObj?.scroll(0, 0);
			break;
		case "bottom":
			thisScrollObj?.scroll(0, thisScrollObj?.scrollHeight);
			break;
		}
	}
}
