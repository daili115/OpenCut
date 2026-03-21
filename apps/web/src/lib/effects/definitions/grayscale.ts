import type { EffectDefinition } from "@/types/effects";
import grayscaleFragmentShader from "./grayscale.frag.glsl";

export const grayscaleEffectDefinition: EffectDefinition = {
	type: "grayscale",
	name: "Grayscale",
	keywords: ["grayscale", "black & white", "b&w", "monochrome"],
	params: [
		{
			key: "amount",
			label: "Amount",
			type: "number",
			default: 1,
			min: 0,
			max: 1,
			step: 0.01,
		},
	],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: grayscaleFragmentShader,
				uniforms: ({ effectParams }) => {
					const amount =
						typeof effectParams.amount === "number"
							? effectParams.amount
							: Number.parseFloat(String(effectParams.amount));
					return {
						u_amount: amount,
					};
				},
			},
		],
	},
};
