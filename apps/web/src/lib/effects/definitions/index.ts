import { hasEffect, registerEffect } from "../registry";
import { blurEffectDefinition } from "./blur";
import { sharpenEffectDefinition } from "./sharpen";
import { grayscaleEffectDefinition } from "./grayscale";

const defaultEffects = [
	blurEffectDefinition,
	sharpenEffectDefinition,
	grayscaleEffectDefinition,
];

export function registerDefaultEffects(): void {
	for (const definition of defaultEffects) {
		if (hasEffect({ effectType: definition.type })) {
			continue;
		}
		registerEffect({ definition });
	}
}
