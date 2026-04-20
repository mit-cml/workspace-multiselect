import * as Blockly from "blockly/core";

const createSerializedKey =
	Blockly.ShortcutRegistry.registry.createSerializedKey.bind(
		Blockly.ShortcutRegistry.registry,
	);

/**
 * Re-maps keyboard navigation shortcuts to new keybindings.
 * @param keybindings Object mapping shortcut registry names to key arrays,
 *     e.g. {toolbox: [KeyCodes.ALT, KeyCodes.T]}.
 */
export function applyShortcutKeybindings(keybindings) {
	const serialized = (keyCodes) =>
		createSerializedKey(keyCodes[keyCodes.length - 1], keyCodes.slice(0, -1));

	for (const [name, keyCodes] of Object.entries(keybindings)) {
		for (const shortcut of [name, `multiselect_${name}`]) {
			const existing =
				Blockly.ShortcutRegistry.registry.getKeyCodesByShortcutName(shortcut);
			if (existing.length === 0) continue;
			Blockly.ShortcutRegistry.registry.removeAllKeyMappings(shortcut);
			Blockly.ShortcutRegistry.registry.addKeyMapping(
				serialized(keyCodes),
				shortcut,
				true,
			);
		}
	}
}
