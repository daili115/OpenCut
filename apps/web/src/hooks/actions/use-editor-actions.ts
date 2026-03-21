"use client";

import { useTimelineStore } from "@/stores/timeline-store";
import { useActionHandler } from "@/hooks/actions/use-action-handler";
import { useEditor } from "../use-editor";
import { useElementSelection } from "../timeline/element/use-element-selection";
import { useKeyframeSelection } from "../timeline/element/use-keyframe-selection";
import { getElementsAtTime } from "@/lib/timeline";
import { DEFAULT_TRANSFORM } from "@/constants/timeline-constants";
import type { VideoElement, ImageElement } from "@/types/timeline";

export function useEditorActions() {
	const editor = useEditor();
	const activeProject = editor.project.getActive();
	const { selectedElements, setElementSelection } = useElementSelection();
	const { selectedKeyframes, clearKeyframeSelection } = useKeyframeSelection();
	const clipboard = useTimelineStore((s) => s.clipboard);
	const setClipboard = useTimelineStore((s) => s.setClipboard);
	const toggleSnapping = useTimelineStore((s) => s.toggleSnapping);
	const rippleEditingEnabled = useTimelineStore((s) => s.rippleEditingEnabled);
	const toggleRippleEditing = useTimelineStore((s) => s.toggleRippleEditing);

	useActionHandler(
		"toggle-play",
		() => {
			editor.playback.toggle();
		},
		undefined,
	);

	useActionHandler(
		"stop-playback",
		() => {
			if (editor.playback.getIsPlaying()) {
				editor.playback.toggle();
			}
			editor.playback.seek({ time: 0 });
		},
		undefined,
	);

	useActionHandler(
		"seek-forward",
		(args) => {
			const seconds = args?.seconds ?? 1;
			editor.playback.seek({
				time: Math.min(
					editor.timeline.getTotalDuration(),
					editor.playback.getCurrentTime() + seconds,
				),
			});
		},
		undefined,
	);

	useActionHandler(
		"seek-backward",
		(args) => {
			const seconds = args?.seconds ?? 1;
			editor.playback.seek({
				time: Math.max(0, editor.playback.getCurrentTime() - seconds),
			});
		},
		undefined,
	);

	useActionHandler(
		"frame-step-forward",
		() => {
			const fps = activeProject.settings.fps;
			editor.playback.seek({
				time: Math.min(
					editor.timeline.getTotalDuration(),
					editor.playback.getCurrentTime() + 1 / fps,
				),
			});
		},
		undefined,
	);

	useActionHandler(
		"frame-step-backward",
		() => {
			const fps = activeProject.settings.fps;
			editor.playback.seek({
				time: Math.max(0, editor.playback.getCurrentTime() - 1 / fps),
			});
		},
		undefined,
	);

	useActionHandler(
		"jump-forward",
		(args) => {
			const seconds = args?.seconds ?? 5;
			editor.playback.seek({
				time: Math.min(
					editor.timeline.getTotalDuration(),
					editor.playback.getCurrentTime() + seconds,
				),
			});
		},
		undefined,
	);

	useActionHandler(
		"jump-backward",
		(args) => {
			const seconds = args?.seconds ?? 5;
			editor.playback.seek({
				time: Math.max(0, editor.playback.getCurrentTime() - seconds),
			});
		},
		undefined,
	);

	useActionHandler(
		"goto-start",
		() => {
			editor.playback.seek({ time: 0 });
		},
		undefined,
	);

	useActionHandler(
		"goto-end",
		() => {
			editor.playback.seek({ time: editor.timeline.getTotalDuration() });
		},
		undefined,
	);

	useActionHandler(
		"split",
		() => {
			const currentTime = editor.playback.getCurrentTime();
			const elementsToSplit =
				selectedElements.length > 0
					? selectedElements
					: getElementsAtTime({
							tracks: editor.timeline.getTracks(),
							time: currentTime,
						});

			if (elementsToSplit.length === 0) return;

			editor.timeline.splitElements({
				elements: elementsToSplit,
				splitTime: currentTime,
			});
		},
		undefined,
	);

	useActionHandler(
		"split-left",
		() => {
			const currentTime = editor.playback.getCurrentTime();
			const elementsToSplit =
				selectedElements.length > 0
					? selectedElements
					: getElementsAtTime({
							tracks: editor.timeline.getTracks(),
							time: currentTime,
						});

			if (elementsToSplit.length === 0) return;

			const rightSideElements = editor.timeline.splitElements({
				elements: elementsToSplit,
				splitTime: currentTime,
				retainSide: "right",
				rippleEnabled: rippleEditingEnabled,
			});

			if (rippleEditingEnabled && rightSideElements.length > 0) {
				const firstRightElement = editor.timeline.getElementsWithTracks({
					elements: [rightSideElements[0]],
				})[0];
				if (firstRightElement) {
					editor.playback.seek({ time: firstRightElement.element.startTime });
				}
			}
		},
		undefined,
	);

	useActionHandler(
		"split-right",
		() => {
			const currentTime = editor.playback.getCurrentTime();
			const elementsToSplit =
				selectedElements.length > 0
					? selectedElements
					: getElementsAtTime({
							tracks: editor.timeline.getTracks(),
							time: currentTime,
						});

			if (elementsToSplit.length === 0) return;

			editor.timeline.splitElements({
				elements: elementsToSplit,
				splitTime: currentTime,
				retainSide: "left",
			});
		},
		undefined,
	);

	useActionHandler(
		"separate-audio",
		() => {
			const currentTime = editor.playback.getCurrentTime();
			const elementsToSeparate =
				selectedElements.length > 0
					? selectedElements
					: getElementsAtTime({
							tracks: editor.timeline.getTracks(),
							time: currentTime,
						});

			if (elementsToSeparate.length === 0) return;

			for (const elementRef of elementsToSeparate) {
				const element = editor.timeline.getElementsWithTracks({
					elements: [elementRef],
				})[0]?.element;

				if (!element || element.type !== "video" || element.muted) continue;

				const audioTrackId = editor.timeline.addTrack({
					type: "audio",
					index: 0,
				});

				editor.timeline.insertElement({
					placement: { mode: "explicit", trackId: audioTrackId },
					element: {
						type: "audio",
						sourceType: "upload",
						mediaId: element.mediaId,
						name: `${element.name} (Audio)`,
						duration: element.duration,
						startTime: element.startTime,
						volume: 1,
						muted: false,
						trimStart: element.trimStart,
						trimEnd: element.trimEnd,
					},
				});

				editor.timeline.updateElements({
					updates: [
						{
							trackId: elementRef.trackId,
							elementId: elementRef.elementId,
							updates: { muted: true },
						},
					],
				});
			}
		},
		undefined,
	);

	useActionHandler(
		"freeze-frame",
		() => {
			const currentTime = editor.playback.getCurrentTime();
			const elementsToFreeze =
				selectedElements.length > 0
					? selectedElements
					: getElementsAtTime({
							tracks: editor.timeline.getTracks(),
							time: currentTime,
						});

			if (elementsToFreeze.length === 0) return;

			for (const elementRef of elementsToFreeze) {
				const result = editor.timeline.getElementsWithTracks({
					elements: [elementRef],
				});

				if (!result[0]?.element) continue;

				const { element: sourceElement, track: sourceTrack } = result[0];

				if (sourceElement.type !== "video") continue;

				const splitTime = Math.max(
					sourceElement.startTime,
					Math.min(
						currentTime,
						sourceElement.startTime + sourceElement.duration,
					),
				);

				if (splitTime <= sourceElement.startTime) continue;

				const splitResults = editor.timeline.splitElements({
					elements: [elementRef],
					splitTime,
				});

				if (splitResults.length === 0) continue;

				const rightElementRef = splitResults[0];
				const rightTrack = editor.timeline.getTrackById({
					trackId: rightElementRef.trackId,
				});

				if (!rightTrack || rightTrack.type !== "video") continue;

				const rightElement = rightTrack.elements.find(
					(e) => e.id === rightElementRef.elementId,
				) as (VideoElement | ImageElement) | null;

				if (!rightElement) continue;

				const freezePoint =
					splitTime - sourceElement.startTime + sourceElement.trimStart;

				editor.timeline.insertElement({
					placement: { mode: "auto", trackType: "video" },
					element: {
						type: "image",
						mediaId: sourceElement.mediaId,
						name: `${sourceElement.name} (Frozen)`,
						duration: rightElement.duration,
						startTime: rightElement.startTime,
						trimStart: freezePoint,
						trimEnd: freezePoint + rightElement.duration,
						hidden: false,
						transform: rightElement.transform || DEFAULT_TRANSFORM,
						opacity:
							typeof rightElement.opacity === "number"
								? rightElement.opacity
								: 1,
						blendMode: rightElement.blendMode || "normal",
					},
				});

				editor.timeline.deleteElements({
					elements: [rightElementRef],
				});
			}
		},
		undefined,
	);

	useActionHandler(
		"delete-selected",
		() => {
			if (selectedKeyframes.length > 0) {
				editor.timeline.removeKeyframes({ keyframes: selectedKeyframes });
				clearKeyframeSelection();
				return;
			}
			if (selectedElements.length === 0) {
				return;
			}
			editor.timeline.deleteElements({
				elements: selectedElements,
				rippleEnabled: rippleEditingEnabled,
			});
			editor.selection.clearSelection();
		},
		undefined,
	);

	useActionHandler(
		"select-all",
		() => {
			const allElements = editor.timeline.getTracks().flatMap((track) =>
				track.elements.map((element) => ({
					trackId: track.id,
					elementId: element.id,
				})),
			);
			setElementSelection({ elements: allElements });
		},
		undefined,
	);

	useActionHandler(
		"deselect-all",
		() => {
			setElementSelection({ elements: [] });
			clearKeyframeSelection();
			const activeElement = document.activeElement;
			if (activeElement instanceof HTMLButtonElement) {
				activeElement.blur();
			}
		},
		undefined,
	);

	useActionHandler(
		"duplicate-selected",
		() => {
			editor.timeline.duplicateElements({
				elements: selectedElements,
			});
		},
		undefined,
	);

	useActionHandler(
		"toggle-elements-muted-selected",
		() => {
			editor.timeline.toggleElementsMuted({ elements: selectedElements });
		},
		undefined,
	);

	useActionHandler(
		"toggle-elements-visibility-selected",
		() => {
			editor.timeline.toggleElementsVisibility({ elements: selectedElements });
		},
		undefined,
	);

	useActionHandler(
		"toggle-bookmark",
		() => {
			editor.scenes.toggleBookmark({ time: editor.playback.getCurrentTime() });
		},
		undefined,
	);

	useActionHandler(
		"copy-selected",
		() => {
			if (selectedElements.length === 0) return;

			const results = editor.timeline.getElementsWithTracks({
				elements: selectedElements,
			});
			const items = results.map(({ track, element }) => {
				const { id: _, ...elementWithoutId } = element;
				return {
					trackId: track.id,
					trackType: track.type,
					element: elementWithoutId,
				};
			});

			setClipboard({ items });
		},
		undefined,
	);

	useActionHandler(
		"paste-copied",
		() => {
			if (!clipboard?.items.length) return;

			editor.timeline.pasteAtTime({
				time: editor.playback.getCurrentTime(),
				clipboardItems: clipboard.items,
			});
		},
		undefined,
	);

	useActionHandler(
		"toggle-snapping",
		() => {
			toggleSnapping();
		},
		undefined,
	);

	useActionHandler(
		"toggle-ripple-editing",
		() => {
			toggleRippleEditing();
		},
		undefined,
	);

	useActionHandler(
		"undo",
		() => {
			editor.command.undo();
		},
		undefined,
	);

	useActionHandler(
		"redo",
		() => {
			editor.command.redo();
		},
		undefined,
	);
}
