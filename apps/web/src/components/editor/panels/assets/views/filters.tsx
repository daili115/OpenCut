"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-view";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { useEditor } from "@/hooks/use-editor";
import { toast } from "sonner";

export const FILTER_TYPES: {
	id: string;
	name: string;
	preview: React.ReactNode;
}[] = [
	{
		id: "brightness",
		name: "Brightness",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-full bg-gradient-to-r from-black/70 via-yellow-200 to-white" />
			</div>
		),
	},
	{
		id: "contrast",
		name: "Contrast",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-md bg-gradient-to-r from-black via-gray-500 to-white" />
			</div>
		),
	},
	{
		id: "saturation",
		name: "Saturation",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-md bg-gradient-to-r from-gray-400 via-red-400 via-green-400 via-blue-400 to-white" />
			</div>
		),
	},
	{
		id: "hue",
		name: "Hue Shift",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-md bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500" />
			</div>
		),
	},
	{
		id: "invert",
		name: "Invert",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="flex h-5 w-10 rounded-md overflow-hidden">
					<div className="h-full w-1/2 bg-muted" />
					<div className="h-full w-1/2 bg-foreground" />
				</div>
			</div>
		),
	},
	{
		id: "grayscale",
		name: "Grayscale",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-md bg-gradient-to-r from-black via-gray-500 to-white" />
			</div>
		),
	},
	{
		id: "sepia",
		name: "Sepia",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="size-10 rounded-md bg-gradient-to-r from-yellow-900 via-amber-600 to-yellow-200" />
			</div>
		),
	},
];

export function FiltersView() {
	return (
		<PanelView title="Filters">
			<div
				className="grid gap-2 p-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
			>
				{FILTER_TYPES.map((filter) => (
					<FilterItem key={filter.id} filter={filter} />
				))}
			</div>
		</PanelView>
	);
}

function FilterItem({
	filter,
}: {
	filter: { id: string; name: string; preview: React.ReactNode };
}) {
	const editor = useEditor();

	const handleAddToTimeline = () => {
		toast.info(`Filter: ${filter.name}`, {
			description: "Select an element on the timeline to apply this filter.",
		});
	};

	return (
		<DraggableItem
			name={filter.name}
			preview={filter.preview}
			dragData={{
				id: filter.id,
				name: filter.name,
				type: "effect",
				effectType: filter.id,
				targetElementTypes: ["video", "image"],
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={1}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
