import * as React from 'react'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { DisposablesComposite, EventEmitter } from 'birch-event-emitter'
import { FixedSizeList } from 'react-window'

import {
	TreeViewModel,
	BirchItem,
	BirchFolder,
	PromptHandleNewItem,
	PromptHandleRename,
} from '../models'

import {
	renderBirchTreeViewItem
} from './BirchTreeViewItem'

import {
	IBirchTreeItemProps,
	ITreeViewExtendedHandle,
	ITreeViewProps,
	ITreeViewHandle,
	EnumBirchItemType,
	EnumTreeViewExtendedEvent
} from '../types'

import { usePrompts } from './BirchUsePrompts';
import { useActiveSelection } from './BirchUseSelection';
import { useContextMenuContainer } from './BirchUseContextMenu';
import { useDragDropContainer } from './BirchUseDragDrop';
import { useDecorations } from './BirchUseDecorations';
import { useHandleApi } from './BirchUseHandleApi';
import { useHandleSimpleApi, TreeViewHandle } from './BirchUseHandleSimpleApi';
import { Decoration } from '../models/decoration';

interface BirchTreeViewPropsInternal extends ITreeViewProps {
	handle: React.MutableRefObject<ITreeViewExtendedHandle>
}

const useForceUpdate = () => {
	const forceUpdater = useState(0)[1]
	return (resolver) => forceUpdater((_st) => { resolver && resolver(); return (_st + 1) })
}

export interface IContext {

	props: ITreeViewProps
	disposables: React.MutableRefObject<DisposablesComposite>
	forceUpdate: (resolver?: any) => void
	treeViewHandleExtended: React.MutableRefObject<ITreeViewExtendedHandle>;
	treeViewHandleSimple: ITreeViewHandle<{}>;
	idxTorendererPropsCache: React.MutableRefObject<Map<number, IBirchTreeItemProps>>;
	events: React.MutableRefObject<EventEmitter<{}>>;
	listRef: React.MutableRefObject<any>;
	wrapperRef: React.MutableRefObject<HTMLDivElement>;
	model: React.MutableRefObject<TreeViewModel>;
	itemIdToRefMap: Map<number, HTMLDivElement>;
	didUpdate: () => void;
	getItemAtIndex: (index: number) => IBirchTreeItemProps;
	commitDebounce: () => Promise<void>;
	adjustedRowCount: number;

	prompts: {
		promptRename: (pathOrItemEntry: string | BirchItem) => Promise<PromptHandleRename>;
		promptNewFolder: (pathOrFolder: string | BirchFolder) => Promise<PromptHandleNewItem>;
		promptNewItem: (pathOrFolder: string | BirchFolder) => Promise<PromptHandleNewItem>;
		supervisePrompt: (promptHandle: PromptHandleNewItem | PromptHandleRename) => void;
	},

	decorations: {
		activeItemDecoration: React.MutableRefObject<Decoration>;
		pseudoActiveItemDecoration: React.MutableRefObject<Decoration>;
	},

	activeSelection: {
		handleItemClicked: (ev: React.MouseEvent<Element, MouseEvent>, item: BirchItem | BirchFolder, type: EnumBirchItemType) => void;
		activeItem: React.MutableRefObject<BirchItem | BirchFolder>;
		pseudoActiveItem: React.MutableRefObject<BirchItem | BirchFolder>;
		updateActiveItem: (fileOrDirOrPath: string | BirchItem | BirchFolder) => Promise<void>
		updatePseudoActiveItem: (fileOrDirOrPath: string | BirchItem | BirchFolder) => Promise<void>;
		handleKeyDown: (ev: React.KeyboardEvent<Element>) => boolean;
		selectionProps: {
			onKeyDown: (ev: React.KeyboardEvent<Element>) => boolean;
			onBlur: () => void;
			onClick: (ev: React.MouseEvent<Element, MouseEvent>) => void;
		};
	},

	contextMenu: {
		handleContextMenu: (ev: React.MouseEvent<Element, MouseEvent>) => void;
		handleItemContextMenu: (ev: React.MouseEvent<Element, MouseEvent>, item: BirchItem | BirchFolder) => void;
	}

	dragDrop: {
		dragAndDropService: any;
		dragged: boolean;
	}

	treeItemView: {
		renderer: any
	}

}

export const BirchTreeView = (props: BirchTreeViewPropsInternal) => {

	const { viewId, options } = props

	const disposables = useRef<DisposablesComposite>(new DisposablesComposite())
	const forceUpdate = useForceUpdate()
	const treeViewHandleExtended = props.handle
	const treeViewHandleSimple = useMemo(() => TreeViewHandle.createTreeView(viewId, options), [viewId, options])
	const idxTorendererPropsCache = useRef<Map<number, IBirchTreeItemProps>>(new Map())
	const events = useRef(new EventEmitter())
	const listRef = options.height > 0 ? useRef<FixedSizeList>() : undefined
	const wrapperRef = useRef<HTMLDivElement>()
	const model = useRef<TreeViewModel>(useMemo(() => new TreeViewModel({ options  }), []))
	const didUpdate = () => events.current.emit(EnumTreeViewExtendedEvent.DidUpdate)
	const itemIdToRefMap = new Map<number, HTMLDivElement>()
	const activeItemDecoration = useRef(new Decoration('active'))
	const pseudoActiveItemDecoration = useRef(new Decoration('pseudo-active'))  
	
	const context = useMemo(() => ( {
		props,
		disposables,
		forceUpdate,
		treeViewHandleExtended,
		treeViewHandleSimple,
		idxTorendererPropsCache,
		events,
		listRef,
		wrapperRef,
		model,
		didUpdate,
		itemIdToRefMap,
		getItemAtIndex: undefined as any,
		commitDebounce: undefined as any,
		adjustedRowCount: undefined as any,
		treeItemView: undefined as any,
		prompts: {} as any,
		activeSelection: {} as any,
		contextMenu: {} as any,
		dragDrop: {} as any,
		decorations: {
			activeItemDecoration,
			pseudoActiveItemDecoration  
		}
	}) as IContext, [])

	const isFirstRun = useRef(true);

	/**
	 * Reset model when root or options props changes
	 */
	useEffect(() => {

		const { disposables, listRef, model, events } = context

		if (!isFirstRun.current) {

			const prevModel = model.current
			const newModel = new TreeViewModel(props)

			disposables.current.dispose()

			if (listRef) {
				listRef.current.scrollTo(prevModel.scrollOffset)
			}

			events.current.emit(EnumTreeViewExtendedEvent.DidChangeModel, prevModel, newModel)

			model.current = newModel
		} else {

			isFirstRun.current = false;

			context.commitDebounce()
		}

		disposables.current.add(model.current.onDidBranchUpdate(context.commitDebounce))

	}, [options.rootPath, props.options])

	/**
	 * Use Active Selection for allowing mouse and keyboard to select items and folders
	 */
	useActiveSelection(context)


	/**
	 * Use Prompts for Renaming and Adding New Folders and Items
	 */
	usePrompts(context)


	/**
	  * Use Extended Handle API
	  */
	useHandleApi(context)


	/**
	 * Use Simple Handle API
	 */
	useHandleSimpleApi(context)


	/**
	* Use Context Menu for context-sensitive popup menus
	*/
	useContextMenuContainer(context)


	/**
	* Use Drag and Drop Service for moving items and folders
	*/
	useDragDropContainer(context)


	/**
	* Hook up decorations sercice
	*/
	useDecorations(context)

	const renderItem = renderBirchTreeViewItem(context)

	useEffect(() => {
		props.options.onCreateView(treeViewHandleSimple)
	}, [treeViewHandleSimple])

	/** Set up FixedSizeList callbacks
	*/
	const handleListScroll = useCallback(({ scrollOffset }) => {
		context.model.current.saveScrollOffset(scrollOffset)
	}, [context.model.current])

	const getItemKey = useCallback((index: number) =>
		context.getItemAtIndex(index).item.id, [context.getItemAtIndex]
	)

	/* RENDER */

	return <div
		className='birch-tree-view'
		{...context.activeSelection.selectionProps}
		onContextMenu={context.contextMenu.handleContextMenu}
		ref={context.wrapperRef}
		tabIndex={-1}>
		{options.height > 0 ? (
			<FixedSizeList
				height={options.height > 0 ? options.height : options.itemHeight * context.adjustedRowCount}
				itemData={[]}
				itemSize={options.itemHeight}
				itemKey={getItemKey}
				itemCount={context.adjustedRowCount}
				overscanCount={5}
				ref={context.listRef}
				onScroll={handleListScroll}
				style={options.style}
				className={options.className}
			>
				{renderItem}
			</FixedSizeList>
		) : (
				<div ref={context.listRef}>
					{Array.apply(null, { length: context.adjustedRowCount }).map(
						(_, index) => {
							return renderItem({ index, style: options.style })
						}
					)}
				</div>
			)}
	</div>
}