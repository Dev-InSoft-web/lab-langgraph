(function () {
	function parseBlock(block) {
		let event = "message";
		const dataLines = [];
		for (const line of block.split("\n")) {
			if (line.startsWith("event:")) event = line.slice(6).trim();
			else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
		}
		if (!dataLines.length) return null;
		try {
			return { event, data: JSON.parse(dataLines.join("\n")) };
		} catch {
			return { event, data: { raw: dataLines.join("\n") } };
		}
	}

	window.Lab = window.Lab || {};
	window.Lab.sse = {
		async consumeSseStream(response, onEvent) {
			const reader = response.body?.getReader();
			if (!reader) throw new Error("Sin body SSE");
			const decoder = new TextDecoder();
			let buffer = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const blocks = buffer.split("\n\n");
				buffer = blocks.pop() || "";
				for (const block of blocks) {
					const evt = parseBlock(block);
					if (evt) onEvent(evt);
				}
			}
		},
	};
})();
