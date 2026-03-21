"use client";

import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserGuideDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] max-w-3xl flex-col p-0">
				<DialogHeader>
					<DialogTitle>使用指南</DialogTitle>
				</DialogHeader>

				<DialogBody className="scrollbar-thin flex-grow overflow-y-auto p-0">
					<Tabs defaultValue="basics" className="flex h-full flex-col">
						<TabsList className="grid w-full grid-cols-4 rounded-none border-b">
							<TabsTrigger value="basics">基础操作</TabsTrigger>
							<TabsTrigger value="editing">编辑功能</TabsTrigger>
							<TabsTrigger value="timeline">时间线</TabsTrigger>
							<TabsTrigger value="shortcuts">快捷键</TabsTrigger>
						</TabsList>

						<ScrollArea className="flex-grow">
							<div className="p-6">
								<TabsContent value="basics" className="mt-0">
									<GuideSection title="开始使用">
										<Guideline
											icon="1"
											title="创建项目"
											description="在主页点击「新建项目」按钮，上传你的视频文件开始编辑"
										/>
										<Guideline
											icon="2"
											title="媒体导入"
											description="点击左侧媒体面板导入视频、音频或图片素材"
										/>
										<Guideline
											icon="3"
											title="添加到时间线"
											description="将媒体文件拖拽到时间线轨道上，或点击素材右侧的「+」按钮"
										/>
										<Guideline
											icon="4"
											title="预览播放"
											description="使用播放控制按钮查看编辑效果，支持播放、暂停、快进/快退"
										/>
									</GuideSection>

									<GuideSection title="基本操作">
										<Guideline
											icon="📽️"
											title="预览区域"
											description="上方为视频预览区，实时显示当前画面效果"
										/>
										<Guideline
											icon="📝"
											title="项目设置"
											description="顶栏左侧显示当前项目名称，可点击重命名"
										/>
										<Guideline
											icon="💾"
											title="自动保存"
											description="项目会自动保存，无需手动存储，关闭后会记住您的进度"
										/>
										<Guideline
											icon="📤"
											title="导出视频"
											description="完成编辑后，点击顶部「导出」按钮选择格式和质量导出"
										/>
									</GuideSection>
								</TabsContent>

								<TabsContent value="editing" className="mt-0">
									<GuideSection title="视频剪辑">
										<Guideline
											icon="✂️"
											title="分割片段"
											description="在时间线上选中片段，使用分割工具在播放头位置分割视频"
										/>
										<Guideline
											icon="📏"
											title="调整长度"
											description="拖动片段边缘调整片段时长，精确控制每个镜头"
										/>
										<Guideline
											icon="🔗"
											title="排列顺序"
											description="拖放片段调整播放顺序，创建流畅的剪辑节奏"
										/>
										<Guideline
											icon="🧊"
											title="冻结帧"
											description="选择片段并使用冻结功能，将某帧画面定格为静态图片"
										/>
									</GuideSection>

									<GuideSection title="高级编辑">
										<Guideline
											icon="🎵"
											title="音频分离"
											description="使用分离音频功能将视频中的音轨提取为独立音频轨道"
										/>
										<Guideline
											icon="👥"
											title="多轨道支持"
											description="可以在多个轨道上添加视频、音频、文本等元素，分层编辑"
										/>
										<Guideline
											icon="🎬"
											title="场景管理"
											description="点击时间线上的场景按钮切换不同场景，场景间独立管理"
										/>
										<Guideline
											icon="🔖"
											title="书签功能"
											description="在关键帧位置添加书签，方便快速定位和编辑"
										/>
									</GuideSection>
								</TabsContent>

								<TabsContent value="timeline" className="mt-0">
									<GuideSection title="时间线工具">
										<Guideline
											icon="✂️"
											title="基础分割"
											description="在播放头位置分割选中的片段"
										/>
										<Guideline
											icon="⬅️"
											title="左侧分割"
											description="在片段左侧进行快速分割操作"
										/>
										<Guideline
											icon="➡️"
											title="右侧分割"
											description="在片段右侧进行快速分割操作"
										/>
										<Guideline
											icon="🎵"
											title="分离音频"
											description="将视频片段的音轨单独提取到音频轨道"
										/>
										<Guideline
											icon="📋"
											title="复制片段"
											description="快速复制选中的片段到新位置"
										/>
										<Guideline
											icon="🗑️"
											title="删除片段"
											description="删除选中的片段，支持多选删除"
										/>
									</GuideSection>

									<GuideSection title="时间线设置">
										<Guideline
											icon="🧲"
											title="自动吸附"
											description="开启后，片段会自动对齐到其他片段边缘，便于精确编辑"
										/>
										<Guideline
											icon="🔗"
											title="涟漪编辑"
											description="开启后，移动片段会自动推动后续片段，保持片段间距不变"
										/>
										<Guideline
											icon="🔍"
											title="缩放控制"
											description="使用右侧的滑块或按钮调整时间线显示的缩放级别"
										/>
										<Guideline
											icon="🔄"
											title="播放头控制"
											description="拖动时间线标尺上的播放头到任意位置预览"
										/>
									</GuideSection>
								</TabsContent>

								<TabsContent value="shortcuts" className="mt-0">
									<GuideSection title="播放控制">
										<ShortcutEntry keys="Space" action="播放/暂停" />
										<ShortcutEntry keys="← / →" action="时间轴左右移动" />
										<ShortcutEntry
											keys="↑ / ↓"
											action="移动播放头至轨道首/尾"
										/>
										<ShortcutEntry keys="Home" action="跳转到开头" />
										<ShortcutEntry keys="End" action="跳转到结尾" />
									</GuideSection>

									<GuideSection title="编辑操作">
										<ShortcutEntry keys="Ctrl + Z" action="撤销操作" />
										<ShortcutEntry keys="Ctrl + Y" action="重做操作" />
										<ShortcutEntry keys="Ctrl + X" action="剪切选中片段" />
										<ShortcutEntry keys="Ctrl + C" action="复制选中片段" />
										<ShortcutEntry keys="Ctrl + V" action="粘贴片段" />
										<ShortcutEntry keys="Delete" action="删除选中片段" />
									</GuideSection>

									<GuideSection title="高级功能">
										<ShortcutEntry keys="S" action="分割片段" />
										<ShortcutEntry keys="M" action="添加/删除书签" />
										<ShortcutEntry keys="Ctrl + S" action="保存项目" />
										<ShortcutEntry keys="Ctrl + N" action="新建项目" />
										<ShortcutEntry keys="Ctrl + O" action="打开项目" />
									</GuideSection>
								</TabsContent>
							</div>
						</ScrollArea>
					</Tabs>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}

function GuideSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-8">
			<h3 className="text-foreground mb-4 text-lg font-semibold">{title}</h3>
			<div className="space-y-3">{children}</div>
		</div>
	);
}

function Guideline({
	icon,
	title,
	description,
}: {
	icon: string;
	title: string;
	description: string;
}) {
	return (
		<div className="bg-muted/50 flex items-start gap-4 rounded-lg p-4">
			<div className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-medium">
				{icon}
			</div>
			<div className="space-y-1">
				<h4 className="text-foreground font-medium">{title}</h4>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
		</div>
	);
}

function ShortcutEntry({ keys, action }: { keys: string; action: string }) {
	return (
		<div className="flex items-center justify-between border-b border-border py-2">
			<span className="text-muted-foreground text-sm">{action}</span>
			<div className="bg-muted flex items-center gap-1 rounded-md px-3 py-1">
				<span className="text-foreground font-mono text-sm">{keys}</span>
			</div>
		</div>
	);
}
