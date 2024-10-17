import { MarkdownView, Plugin } from "obsidian";
import { OnyxSideButtonSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { OnyxSideButtonSettingsTab } from "./settings/settingsTab";

export default class OnyxSideButton extends Plugin {
	settings: OnyxSideButtonSettings;
	lastPageY: number;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new OnyxSideButtonSettingsTab(this.app, this));
		this.registerEvent(
			this.app.workspace.on("file-open", (_) => {
				const viewEl = document.querySelector(".markdown-reading-view") as HTMLElement;

				viewEl.ontouchstart = (evt) => {
					this.lastPageY = evt.touches[0].pageY;
				};
				let lastCall = 0;
				const throttleTime = 1000;
				viewEl.ontouchmove = (evt) => {
					evt.preventDefault();
					const now = Date.now();
					if (now - lastCall < throttleTime) return;
					lastCall = now;
					const newdata = evt.touches[0].pageY;
					this.flip(this.lastPageY < newdata ? "up" : "down");
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
