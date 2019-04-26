import { useRef, useCallback, useMemo } from 'react'

import {
	BirchFolder,
	BirchItem,
	BirchRoot,
	PromptHandleNewItem,
	PromptHandle,
	PromptHandleRename,
	EnumBirchWatchEvent,
} from '../models'

import {
	IBirchTreeItemProps,
	EnumBirchItemType,
	EnumTreeItemType,
	IContext
} from '../types'

const BATCHED_UPDATE_MAX_DEBOUNCE_MS = 4

export const usePrompts = (context: IContext) => {

	const {
		model,
		listRef,
		idxTorendererPropsCache,
		didUpdate,
		forceUpdate,
		treeViewHandleExtended,
		props: { options: { treeDataProvider } } } = context

	const newItemPromptInsertionIndex = useRef<number>(-1)
	const promptTargetID = useRef<number>(-1)  // NumericID <BirchItem | BirchFolder>
	const promptHandle = useRef<PromptHandleNewItem | PromptHandleRename>()

	
	const commitDebounce = useMemo(() => {
		// For every caller who calls `commitDebounce` within `BATCHED_UPDATE_MAX_WAIT_MS`, they are given same `Promise` object they can `await` upon
		let onePromise: Promise<void>
		let timer: number
		let resolver

		const commitUpdate = () => {
		
			let _newItemPromptInsertionIndex: number = -1
			if (promptTargetID.current > -1 &&
				promptHandle.current instanceof PromptHandleNewItem &&
				promptHandle.current.parent.expanded && model.current.root.isItemVisibleAtSurface(promptHandle.current.parent) &&
				!promptHandle.current.destroyed) {
				const idx = model.current.root.getIndexAtItemEntryID(promptTargetID.current)
				if (idx > -1 || promptHandle.current.parent === model.current.root) {
					_newItemPromptInsertionIndex = idx + 1
				} else {
					promptTargetID.current = -1
				}
			}
			newItemPromptInsertionIndex.current = _newItemPromptInsertionIndex
			idxTorendererPropsCache.current.clear()
			forceUpdate(resolver)
		}

		return () => {
			if (!onePromise) {
				onePromise = new Promise((res) => resolver = res)
				onePromise.then(() => {
					onePromise = null
					resolver = null
					didUpdate()
				})
			}
			// (re)schedule update commitment
			clearTimeout(timer)
			timer = setTimeout(commitUpdate, BATCHED_UPDATE_MAX_DEBOUNCE_MS) as any
			return onePromise
		}
	}, [])

	const supervisePrompt = useCallback((promptHandle: PromptHandleRename | PromptHandleNewItem) => {
		if (!promptHandle.destroyed) {
			
			// returning false from `onBlur` listener will prevent `PromptHandle` from being automatically destroyed
		 	promptHandle.onBlur(() => {
			   return true
			})

			let didMarkInvalid = false
			promptHandle.onChange((currentValue) => {
				if (currentValue.trim() !== '' && false) {
					promptHandle.addClassName('invalid')
					didMarkInvalid = true
				} else {
					if (didMarkInvalid) {
						promptHandle.removeClassName('invalid')
						didMarkInvalid = false
					}
				}
			})

			let pulseTimer: number
			promptHandle.onCommit(async (newName) => {
				if (newName.trim() === '') {
					return
				}
				if (false) {
					promptHandle.addClassName('invalid')
					clearTimeout(pulseTimer)
					promptHandle.addClassName('invalid-input-pulse')
					pulseTimer = setTimeout(() => {
						promptHandle.removeClassName('invalid-input-pulse')
					}, 600)
					console.log("Invalid item name in BirchUsePrompts")
					return false // prevent input from being destroyed
				} else {
					promptHandle.removeClassName('invalid')
					promptHandle.removeClassName('invalid-input-pulse')
					if (promptHandle instanceof PromptHandleRename) {
						const target = promptHandle.target
						const oldPath = target.path
						const newPath = model.current.root.pathfx.join(target.parent.path, newName)
						const res = await treeDataProvider.moveItem(target, target.parent, newPath)
						// "truthy" values won't be enough, must be explicit `true`
						if (res === true) {
							treeViewHandleExtended.current.onceDidUpdate(() => {
								treeViewHandleExtended.current.ensureVisible(target)
							})
							model.current.root.inotify({
								type: EnumBirchWatchEvent.Moved,
								tid: target.tid,
								oldPath,
								newPath,
							})
						}
					} else if (promptHandle instanceof PromptHandleNewItem) {
						const parentDir = promptHandle.parent
						const newPath = model.current.root.pathfx.join(parentDir.path, newName)
						const maybeItem = await treeDataProvider.createItem(parentDir, newName, newPath, promptHandle.type)
						if (maybeItem && maybeItem.type && maybeItem.label) {
							model.current.root.inotify({
								type: EnumBirchWatchEvent.Added,
								folder: parentDir.path,
								item: maybeItem,
							})
						} else { console.log("Added but not notify in BirchUsePrompts", maybeItem) }
					}
				}
			})
		}
	}, [
			model,
			treeDataProvider
		])

	const updatePromptHandle = useCallback((handle: PromptHandleNewItem | PromptHandleRename) => {

		if (promptHandle.current === handle) { return }

		if (promptHandle.current instanceof PromptHandle && !promptHandle.current.destroyed) {
			promptHandle.current.destroy()
		}

		handle.onDestroy(commitDebounce)

		promptHandle.current = handle

	}, [])

	const promptRename = useCallback(async (pathOrItemEntry: string | BirchItem): Promise<PromptHandleRename> => {
		await model.current.root.flushEventQueue()
		const itemEntry = typeof pathOrItemEntry === 'string'
			? await model.current.root.forceLoadItemEntryAtPath(pathOrItemEntry)
			: pathOrItemEntry

		if (!(itemEntry instanceof BirchItem) || itemEntry.constructor === BirchRoot) {
			throw new TypeError(`Cannot rename object of type ${typeof itemEntry}`)
		}
		const _promptHandle = new PromptHandleRename(itemEntry.label, itemEntry)
		updatePromptHandle(_promptHandle)
		promptTargetID.current = itemEntry.id
		if (!model.current.root.isItemVisibleAtSurface(itemEntry)) {
			await model.current.root.expandFolder(itemEntry.parent)
		} else {
			await commitDebounce()
		}

		if (listRef) {
			listRef.current.scrollToItem(model.current.root.getIndexAtItemEntryID(itemEntry.id))
		}

		return _promptHandle

	}, [listRef])

	const promptNew = useCallback(async (pathOrFolder: string | BirchFolder, type: EnumTreeItemType): Promise<PromptHandleNewItem> => {
		await model.current.root.flushEventQueue()
		const folder = typeof pathOrFolder === 'string'
			? await model.current.root.forceLoadItemEntryAtPath(pathOrFolder)
			: pathOrFolder

		if (!(folder instanceof BirchFolder)) {
			throw new TypeError(`Cannot create new item prompt at object of type ${typeof folder}`)
		}

		if (type !== EnumTreeItemType.Item && type !== EnumTreeItemType.Folder) {
			throw new TypeError(`Invalid type supplied. Expected 'EnumTreeItemType.Item' or 'EnumTreeItemType.Folder', got ${type}`)
		}

		const _promptHandle = new PromptHandleNewItem(type, folder)
		updatePromptHandle(_promptHandle)
		promptTargetID.current = folder.id
		if (folder !== model.current.root && (!folder.expanded || !model.current.root.isItemVisibleAtSurface(folder))) {
			// will trigger `update()` anyway
			await model.current.root.expandFolder(folder)
		} else {
			await commitDebounce()
		}
		if (listRef) {
			listRef.current.scrollToItem(newItemPromptInsertionIndex.current)
		}
		return _promptHandle
	}, [listRef])

	const promptNewFolder = useCallback((pathOrFolder: string | BirchFolder): Promise<PromptHandleNewItem> => {
		return promptNew(pathOrFolder, EnumTreeItemType.Folder)
	}, [promptNew])

	const promptNewItem = useCallback((pathOrFolder: string | BirchFolder): Promise<PromptHandleNewItem> => {
		return promptNew(pathOrFolder, EnumTreeItemType.Item)
	}, [promptNew])

	const adjustedRowCount = useMemo(() => {
		return (
			(newItemPromptInsertionIndex.current > -1) &&
			promptHandle.current && promptHandle.current.constructor === PromptHandleNewItem &&
			!promptHandle.current.destroyed)
			? model.current.root.branchSize + 1
			: model.current.root.branchSize
		}, [promptHandle.current, newItemPromptInsertionIndex.current, model.current.root.branchSize])

	const getItemAtIndex = useCallback((index: number): IBirchTreeItemProps => {

		let cached: IBirchTreeItemProps = idxTorendererPropsCache.current.get(index)

		if (!cached) {

			const promptInsertionIdx = newItemPromptInsertionIndex.current

			// new item prompt
			if (promptInsertionIdx > -1 &&

				promptHandle.current && promptHandle.current.constructor === PromptHandleNewItem &&
				!promptHandle.current.destroyed) {

				if (index === promptInsertionIdx) {

					cached = {
						itemType: (promptHandle.current as PromptHandleNewItem).type === EnumTreeItemType.Item ? EnumBirchItemType.NewItemPrompt : EnumBirchItemType.NewFolderPrompt,
						item: promptHandle.current as PromptHandleNewItem,
					} as any

				} else {

					const item = model.current.root.getItemEntryAtIndex(index - (index >= promptInsertionIdx ? 1 /* apply virtual backshift */ : 0))
					cached = {
						itemType: item.constructor === BirchFolder ? EnumBirchItemType.BirchFolder : EnumBirchItemType.BirchItem,
						item,
					} as any

				}

			} else {

				const item = model.current.root.getItemEntryAtIndex(index)

				// check for rename prompt
				if (item && item.id === promptTargetID.current &&
					promptHandle.current && promptHandle.current.constructor === PromptHandleRename &&
					(promptHandle.current as PromptHandleRename).originalLabel === item.label &&
					!promptHandle.current.destroyed) {

					cached = {
						itemType: EnumBirchItemType.RenamePrompt,
						item: promptHandle.current as PromptHandleRename,
					}

				} else {

					cached = {
						itemType: item.constructor === BirchFolder ? EnumBirchItemType.BirchFolder : EnumBirchItemType.BirchItem,
						item,
					} as any

				}

			}

			idxTorendererPropsCache.current.set(index, cached)

		}

		return cached

	}, [])

	Object.assign(context,
		{
			adjustedRowCount,
			getItemAtIndex,
			commitDebounce,
			prompts: {
				promptRename,
				promptNewFolder,
				promptNewItem,
				supervisePrompt
			}
		})
}


export const usePromptsChild = (itemType) => {

	const isRenamePrompt = itemType === EnumBirchItemType.RenamePrompt

	const isNewPrompt =
	  itemType === EnumBirchItemType.NewFolderPrompt ||
	  itemType === EnumBirchItemType.NewItemPrompt
  
	const isPrompt = isRenamePrompt || isNewPrompt

	return [isPrompt, isNewPrompt, isRenamePrompt]
  
   
}