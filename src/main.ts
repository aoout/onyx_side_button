import { MarkdownView, Plugin } from "obsidian";

export default class OnyxSideButton extends Plugin {
	lastPageY: number;
	async onload() {
		this.registerEvent(
			this.app.workspace.on("file-open", (_) => {
				const viewEl = document.querySelector(".markdown-reading-view") as HTMLElement;

				viewEl.ontouchstart = (evt) => {
					this.lastPageY = evt.touches[0].pageY;
					evt.preventDefault();
				};
				let lastCall = 0;
				const throttleTime = 1000;
				viewEl.ontouchmove = (evt) => {
					const now = Date.now();
					if (now - lastCall < throttleTime) return;
					lastCall = now;
					evt.preventDefault();
					const newdata = evt.touches[0].pageY;
					if (this.lastPageY < newdata) {
						this.flip("up");
					} else {
						this.flip("down");
					}
				};
			})
		);
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
		const range = thisScrollObj.clientHeight - 60;
		switch (mode) {
		case "up":
			thisScrollObj.scrollBy(0, -range);
			break;
		case "down":
			thisScrollObj.scrollBy(0, range);
			break;
		}
	}
}
