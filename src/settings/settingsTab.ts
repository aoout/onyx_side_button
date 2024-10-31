import OnyxSideButton from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";


export class OnyxSideButtonSettingsTab extends PluginSettingTab {
	plugin: OnyxSideButton;
	constructor(app: App, plugin: OnyxSideButton) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Fliping bias")
			.setDesc("Fliping bias")
			.addText((text) =>
				text
					.setPlaceholder("60")
					.setValue(String(this.plugin.settings.flipingBias))
					.onChange(async (value) => {
						this.plugin.settings.flipingBias = Number(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Double Click Interval")
			.setDesc("Double click interval upper limit.")
			.addText((text) =>
				text
					.setPlaceholder("1000")
					.setValue(String(this.plugin.settings.doubleClickInterval))
					.onChange(async (value) => {
						this.plugin.settings.doubleClickInterval = Number(value);
						await this.plugin.saveSettings();
					})
			);
	}
}

