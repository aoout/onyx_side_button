import { MarkdownView, Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, OnyxSideButtonSettings } from "./settings/settings";
import { OnyxSideButtonSettingsTab } from "./settings/settingsTab";

export default class OnyxSideButton extends Plugin {
	settings: OnyxSideButtonSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new OnyxSideButtonSettingsTab(this.app, this));
		this.addCommand({
			id: "test",
			name: "test",
			callback: () => {
				this.flip("down");
			},
		});
		this.registerEvent(
			this.app.workspace.on("file-open", (_) => {
				let lastKeyDownTime = 0;
				let lastKeyDownKey = "";
				document.onkeydown = (evt) => {
					new Notice(evt.key);
					if (evt.key == "PageUp" || evt.key == "PageDown") {
						evt.preventDefault();
						const currentTime = new Date().getTime();
						if (currentTime - lastKeyDownTime < this.settings.doubleClickInterval && lastKeyDownKey === evt.key) {
							this.flip(evt.key == "PageUp" ? "top" : "bottom");
						} else {
							this.flip(evt.key == "PageUp" ? "up" : "down");
						}
						lastKeyDownTime = currentTime;
						lastKeyDownKey = evt.key;
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
			// @ts-ignore
				? thisView?.previewMode?.renderer?.previewEl
				// @ts-ignore
				: thisView?.editMode?.cm?.scrollDOM;
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
		switch (mode) {
		case "up":
			thisScrollObj?.scrollBy(0, -range);
			break;
		case "down":
			thisScrollObj?.scrollBy(0, range);
			console.log(thisScrollObj.scrollTop);
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
