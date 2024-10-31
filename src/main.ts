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
					if (evt.key == "PageUp" || evt.key == "PageDown") {
						evt.preventDefault();
						this.flip(evt.key == "PageUp" ? "up" : "down");
					}
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
		let thisScrollObj =
			thisView?.getMode() == "preview"
				? // @ts-ignore
				thisView?.previewMode?.renderer?.previewEl
				: // @ts-ignore
				thisView?.editMode?.cm?.scrollDOM;
		if (!thisScrollObj) {
			// for TextFileView
			try {
				// @ts-ignore
				thisScrollObj = this.app.workspace.getActiveFileView()?.containerEl?.children[1];
				if (!thisScrollObj) {
					console.error("scroll failed ==> scrollObj is missing");
					return;
				}
			} catch (e) {
				console.error("scroll failed ==> ", e);
				return;
			}
		}
		const range = thisScrollObj?.clientHeight - this.settings.flipingBias;
		thisScrollObj?.scrollBy(0, mode === "up" ? -range : range);
	}
}
