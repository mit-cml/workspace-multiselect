import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:8080";

export default defineConfig({
	testDir: "./test-e2e",
	fullyParallel: true,
	reporter: [["list"], ["html"]],
	expect: {
		toMatchAriaSnapshot: {
			children: "deep-equal",
		},
	},
	use: {
		baseURL,
	},
	webServer: {
		command: "npm start",
		url: baseURL,
		reuseExistingServer: true,
	},
});
