import { MarkdownView, Plugin } from "obsidian";

export default class OnyxSideButton extends Plugin {
	lastPageY: number;
	async onload() {
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

	flip(mode: string) {
		const thisView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// @ts-ignore
		const thisScrollObj = thisView?.previewMode?.renderer?.previewEl;
		const range = thisScrollObj?.clientHeight - 60;
		thisScrollObj?.scrollBy(0, mode === "up" ? -range : range);
	}
}
