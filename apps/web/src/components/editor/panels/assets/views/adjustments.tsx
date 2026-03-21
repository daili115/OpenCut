"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-view";
import { useEditor } from "@/hooks/use-editor";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "@/components/editor/panels/properties/section";
import { useState } from "react";
import type { TBackground } from "@/types/project";

export function AdjustmentView() {
	const editor = useEditor();
	const activeProject = editor.project.getActive();
	const background = activeProject.settings.background;

	return (
		<PanelView hideHeader contentClassName="px-0">
			<div className="flex flex-col">
				<Section showTopBorder={false}>
					<SectionContent>
						<BackgroundSection />
					</SectionContent>
				</Section>

				<Section>
					<SectionHeader>
						<SectionTitle>White Balance</SectionTitle>
					</SectionHeader>
					<SectionContent>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label>Temperature</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Tint</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
						</div>
					</SectionContent>
				</Section>

				<Section>
					<SectionHeader>
						<SectionTitle>Color</SectionTitle>
					</SectionHeader>
					<SectionContent>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label>Saturation</Label>
								<Slider
									defaultValue={[100]}
									min={0}
									max={200}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Vibrance</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
						</div>
					</SectionContent>
				</Section>

				<Section>
					<SectionHeader>
						<SectionTitle>Tone</SectionTitle>
					</SectionHeader>
					<SectionContent>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label>Exposure</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Contrast</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Highlights</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Shadows</Label>
								<Slider
									defaultValue={[0]}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>
						</div>
					</SectionContent>
				</Section>
			</div>
		</PanelView>
	);
}

function BackgroundSection() {
	const editor = useEditor();
	const activeProject = editor.project.getActive();
	const [backgroundColor, setBackgroundColor] = useState<string>(() => {
		if (activeProject.settings.background?.type === "color") {
			return activeProject.settings.background.color;
		}
		return "#000000";
	});

	const handleBackgroundColorChange = (color: string) => {
		setBackgroundColor(color);
		editor.project.updateSettings({
			settings: { background: { type: "color", color } },
		});
	};

	const presetColors = [
		"#000000",
		"#ffffff",
		"#1a1a1a",
		"#2d2d2d",
		"#1e293b",
		"#312e81",
		"#7c2d12",
		"#14532d",
		"#0f766e",
		"#0c4a6e",
		"#701a75",
		"#be123c",
	];

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-2">
				<Label>Background Color</Label>
				<div className="flex items-center gap-2">
					<input
						type="color"
						value={backgroundColor}
						onChange={(e) => handleBackgroundColorChange(e.target.value)}
						className="size-10 cursor-pointer rounded-md border border-input"
					/>
					<input
						type="text"
						value={backgroundColor}
						onChange={(e) => handleBackgroundColorChange(e.target.value)}
						className="flex h-10 w-32 rounded-md border border-input px-3 py-2 text-sm"
						placeholder="#000000"
					/>
					<button
						type="button"
						className="rounded-md border bg-muted px-3 py-2 text-sm hover:bg-accent"
						onClick={() => handleBackgroundColorChange("#000000")}
					>
						Reset
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Quick Presets</Label>
				<div className="grid grid-cols-[repeat(7,1fr)] gap-2">
					{presetColors.map((color) => (
						<button
							key={color}
							type="button"
							className="aspect-square rounded-md border-2 transition-all hover:scale-110 hover:border-primary"
							style={{ backgroundColor: color }}
							onClick={() => handleBackgroundColorChange(color)}
							title={color}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
