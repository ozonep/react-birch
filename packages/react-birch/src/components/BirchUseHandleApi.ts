import { useEffect, useRef } from "react";
import { BirchFolder, BirchItem, BirchRoot, EnumBirchWatchEvent } from "../models";
import { EnumTreeItemType, EnumTreeViewExtendedEvent, ITreeViewExtendedHandle, IContext } from "../types";
import { Align } from 'react-window'
import { DisposablesComposite, EventEmitter } from 'birch-event-emitter';

export const useHandleApi = (context: IContext) => {

	const {
		props: { options: { onReady } },
		listRef,
		treeViewHandleExtended,
		model,
		wrapperRef,
		activeSelection: { activeItem,
			pseudoActiveItem,
			updateActiveItem,
			updatePseudoActiveItem, },
		prompts: { supervisePrompt,
			promptRename,
			promptNewFolder,
			promptNewItem },
	} = context

	const disposables = useRef<DisposablesComposite>(new DisposablesComposite())
	const events = useRef<EventEmitter<EnumTreeViewExtendedEvent>>(new EventEmitter())

	useEffect(() => {

		const getItemHandle = async (path: string, expandTree = true) => {
			const fileH = await model.current.root.forceLoadItemEntryAtPath(path)
			if (expandTree && !model.current.root.isItemVisibleAtSurface(fileH)) {
				await model.current.root.expandFolder(fileH.parent, true)
			}
			return fileH
		}

		const openFolder = async (pathOrFolder: string | BirchFolder) => {
			const folder: BirchFolder = typeof pathOrFolder === 'string'
				? await model.current.root.forceLoadItemEntryAtPath(pathOrFolder) as BirchFolder
				: pathOrFolder

		
			if (folder && folder.constructor === BirchFolder) {
				return model.current.root.expandFolder(folder)
			}
		}

		const closeFolder = async (pathOrFolder: string | BirchFolder) => {
			const folder: BirchFolder = typeof pathOrFolder === 'string'
				? await model.current.root.forceLoadItemEntryAtPath(pathOrFolder)  as  BirchFolder
				: pathOrFolder

			if (folder && folder.constructor === BirchFolder) {
				return model.current.root.collapseFolder(folder)
			}
		}

		const toggleFolder = async (pathOrDir: string | BirchFolder) => {
			const dir = typeof pathOrDir === 'string'
				? await getItemHandle(pathOrDir)
				: pathOrDir
			if (dir.type === EnumTreeItemType.Folder) {
				if ((dir as BirchFolder).expanded) {
					closeFolder(dir as BirchFolder)
				} else {
					openFolder(dir as BirchFolder)
				}
			}
		}

		const collapseAll = async () => {

			await model.current.root.flushEventQueue()

			const toFlatten: BirchFolder[] = []

			for (var _i = 0; _i < model.current.root.branchSize; _i++) {
				let entry = model.current.root.getItemEntryAtIndex(_i)
				if (entry.type == EnumTreeItemType.Folder && (entry as BirchFolder).expanded) {
					toFlatten.push(entry as BirchFolder)
				}
			}

			toFlatten.forEach((entry) => entry.setCollapsed())

			updateActiveItem(null)
			updatePseudoActiveItem(null)
			events.current.emit(EnumTreeViewExtendedEvent.OnDidChangeSelection, null)

		}

		const scrollIntoView = (itemOrFolder: BirchItem | BirchFolder, align: Align = 'center') => {
			const idx = model.current.root.getIndexAtItemEntry(itemOrFolder)
			if (idx > -1) {
				if (listRef) {
					listRef.current.scrollToItem(idx, align)
				}
				return true
			}
			return false
		}

		const ensureVisible = async (pathOrItemEntry: string | BirchItem | BirchFolder, align: Align = 'auto') => {
			await model.current.root.flushEventQueue()

			const itemEntry = typeof pathOrItemEntry === 'string'
				? await model.current.root.forceLoadItemEntryAtPath(pathOrItemEntry)
				: pathOrItemEntry

			if (!(itemEntry instanceof BirchItem) || itemEntry.constructor === BirchRoot) {
				throw new TypeError(`Object not a valid BirchItem`)
			}
			if (scrollIntoView(itemEntry, align)) {
				return
			}
			await model.current.root.expandFolder(itemEntry.parent, true)
			if (listRef) {
				listRef.current.scrollToItem(model.current.root.getIndexAtItemEntry(itemEntry), align)
			}
		}

		const unlinkItem = async (fileOrDirOrPath: BirchItem | BirchFolder | string) => {
			const filedir = typeof fileOrDirOrPath === 'string'
				? await treeViewHandleExtended.current.getItemHandle(fileOrDirOrPath)
				: fileOrDirOrPath

			model.current.root.inotify({
				type: EnumBirchWatchEvent.Removed,
				tid: filedir.tid,
				path: filedir.path,
			})
		}


		const handle: ITreeViewExtendedHandle = {

			getModel: () => model.current,

			getActiveItem: () => activeItem.current,
			setActiveItem: updateActiveItem,
			getPseudoActiveItem: () => pseudoActiveItem.current,
			setPseudoActiveItem: updatePseudoActiveItem,

			openFolder: openFolder,
			closeFolder: closeFolder,
			toggleFolder: toggleFolder,
			collapseAll: collapseAll,
			getItemHandle: getItemHandle,
			ensureVisible: ensureVisible,

			unlinkItem: async (fileOrDirOrPath: BirchItem | BirchFolder | string) => unlinkItem(fileOrDirOrPath),
			rename: async (fileOrDirOrPath: BirchItem | BirchFolder | string) => supervisePrompt(await promptRename(fileOrDirOrPath as any)),
			newItem: async (dirOrPath: BirchFolder | string) => supervisePrompt(await promptNewItem(dirOrPath as any)),
			newFolder: async (dirOrPath: BirchFolder | string) => supervisePrompt(await promptNewFolder(dirOrPath as any)),
			onBlur: (callback) => events.current.on(EnumTreeViewExtendedEvent.OnBlur, callback),
			onDidChangeSelection: (callback) => events.current.on(EnumTreeViewExtendedEvent.OnDidChangeSelection, callback),
			hasDirectFocus: () => wrapperRef.current === document.activeElement,

			onDidChangeModel: (callback) => events.current.on(EnumTreeViewExtendedEvent.DidChangeModel, callback),
			onceDidChangeModel: (callback) => events.current.once(EnumTreeViewExtendedEvent.DidChangeModel, callback),
			onDidUpdate: (callback) => events.current.on(EnumTreeViewExtendedEvent.DidUpdate, callback),
			onceDidUpdate: (callback) => events.current.once(EnumTreeViewExtendedEvent.DidUpdate, callback),

			events: events.current,

		}

		if (typeof onReady === 'function') {
			onReady(handle)
		}

		treeViewHandleExtended.current = handle

		return () => {
			disposables.current.dispose()
		}

	}, [])

}