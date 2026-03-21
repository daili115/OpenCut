"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-view";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { useEditor } from "@/hooks/use-editor";
import type { TransitionType } from "@/lib/transitions";
import { toast } from "sonner";

export const TRANSITION_TYPES: {
	id: TransitionType;
	name: string;
	preview: React.ReactNode;
}[] = [
	{
		id: "fade",
		name: "Fade",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative size-16 rounded-md bg-gradient-to-r from-transparent via-black/50 to-transparent" />
			</div>
		),
	},
	{
		id: "slide-left",
		name: "Slide Left",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative flex gap-2">
					<div className="size-8 rounded-md bg-muted/50" />
					<div className="size-8 rounded-md bg-muted" />
				</div>
			</div>
		),
	},
	{
		id: "slide-right",
		name: "Slide Right",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative flex gap-2">
					<div className="size-8 rounded-md bg-muted" />
					<div className="size-8 rounded-md bg-muted/50" />
				</div>
			</div>
		),
	},
	{
		id: "slide-up",
		name: "Slide Up",
		preview: (
			<div className="flex size-full flex-col items-center justify-center gap-1">
				<div className="size-8 rounded-md bg-muted/50" />
				<div className="size-8 rounded-md bg-muted" />
			</div>
		),
	},
	{
		id: "slide-down",
		name: "Slide Down",
		preview: (
			<div className="flex size-full flex-col items-center justify-center gap-1">
				<div className="size-8 rounded-md bg-muted" />
				<div className="size-8 rounded-md bg-muted/50" />
			</div>
		),
	},
	{
		id: "zoom",
		name: "Zoom",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative size-10 rounded-full border-2 border-muted" />
				<div className="absolute size-6 rounded-full bg-muted/50" />
			</div>
		),
	},
	{
		id: "dissolve",
		name: "Dissolve",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative">
					<div
						className="size-12 rounded-md"
						style={{
							backgroundImage:
								"radial-gradient(circle at 30% 30%, transparent 0%, transparent 20%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 40%, transparent 40%, transparent 60%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.1) 80%, transparent 80%)",
							backgroundColor: "hsl(var(--muted))",
						}}
					/>
				</div>
			</div>
		),
	},
	{
		id: "wipe-left",
		name: "Wipe Left",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative size-12 rounded-md overflow-hidden">
					<div className="absolute inset-0 bg-muted" />
					<div className="absolute left-0 top-0 bottom-0 w-1/2 bg-muted/30" />
				</div>
			</div>
		),
	},
	{
		id: "wipe-right",
		name: "Wipe Right",
		preview: (
			<div className="flex size-full items-center justify-center">
				<div className="relative size-12 rounded-md overflow-hidden">
					<div className="absolute inset-0 bg-muted" />
					<div className="absolute right-0 top-0 bottom-0 w-1/2 bg-muted/30" />
				</div>
			</div>
		),
	},
];

export function TransitionsView() {
	return (
		<PanelView title="Transitions">
			<div
				className="grid gap-2 p-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
			>
				{TRANSITION_TYPES.map((transition) => (
					<TransitionItem key={transition.id} transition={transition} />
				))}
			</div>
		</PanelView>
	);
}

function TransitionItem({
	transition,
}: {
	transition: {
		id: TransitionType;
		name: string;
		preview: React.ReactNode;
	};
}) {
	const editor = useEditor();

	const handleAddToTimeline = () => {
		const currentTime = editor.playback.getCurrentTime();
		toast.info(`Add to timeline`, {
			description: `"${transition.name}" transition will apply to selected elements. Select two elements to apply transition between them.`,
		});
	};

	return (
		<DraggableItem
			name={transition.name}
			preview={transition.preview}
			dragData={{
				id: transition.id,
				name: transition.name,
				type: "transition",
				transitionType: transition.id,
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={1}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
