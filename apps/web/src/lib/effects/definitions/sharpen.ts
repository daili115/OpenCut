import type { EffectDefinition } from "@/types/effects";
import sharpenFragmentShader from "./sharpen.frag.glsl";

export const sharpenEffectDefinition: EffectDefinition = {
	type: "sharpen",
	name: "Sharpen",
	keywords: ["sharpen", "crisp", "detail"],
	params: [
		{
			key: "intensity",
			label: "Intensity",
			type: "number",
			default: 1,
			min: 0,
			max: 5,
			step: 0.1,
		},
	],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: sharpenFragmentShader,
				uniforms: ({ effectParams }) => {
					const intensity =
						typeof effectParams.intensity === "number"
							? effectParams.intensity
							: Number.parseFloat(String(effectParams.intensity));
					return {
						u_intensity: intensity,
						u_resolution: [1, 1],
					};
				},
			},
		],
	},
};
