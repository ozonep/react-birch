import { BirchFolder } from './BirchFolder'
import { BirchRoot } from './BirchRoot'
import { IBirchTreeSupervisor } from '../../types/birch'
import { EnumTreeItemType, ITreeItemRaw, ITreeItem } from '../../types'

export class BirchItem implements ITreeItemRaw {

	public static nextId = (() => {
		let id = 0
		return () => id++
	})()

	public static checkRawItem(rawItem: ITreeItemRaw) {
		if (rawItem === null || typeof rawItem !== 'object') {
			throw new TypeError(`BirchItem must be ITreeItemRaw object. See docs for more info`)
		}
		if (rawItem.type !== EnumTreeItemType.Folder && rawItem.type !== EnumTreeItemType.Item) {
			throw new TypeError(`ITreeItemRaw must have a 'type' property which is either EnumTreeItemType.Item or EnumTreeItemType.Folder`)
		}
		if (typeof rawItem.label !== 'string') {
			throw new TypeError(`ITreeItemRaw must have a 'label' property of type string`)
		}
	}

	public static getItemEntryById(id: number) {
		return BirchItem.idToItemEntry.get(id)
	}

	private static idToItemEntry: Map<number, BirchItem> = new Map()
	protected _uid: number
	protected _depth: number
	protected _label: string
	protected _tid: string
	protected _details: ITreeItem
	protected _superv: IBirchTreeSupervisor
	private _root: BirchRoot
	private _parent: BirchFolder
	private _disposed: boolean

	private resolvedPathCache: string

	public forceUpdate: (resolver?: any) => void

	protected constructor(root: BirchRoot, tree: IBirchTreeSupervisor, parent: BirchFolder, label: string, tid: string, details: ITreeItem) {
		this._uid = BirchItem.nextId()
		this._root = root ? root : (this as any) as BirchRoot // 'this' IS BirchRoot
		this._parent = parent
		this._superv = tree
		this._disposed = false
		this._depth = parent ? parent.depth + 1 : 0
		if (parent && typeof label === 'string') {
			label = root.pathfx.basename(label)
			this._label = label
		}
		this._tid = tid
		this._details = details
		BirchItem.idToItemEntry.set(this._uid, this)
	}

	get type(): EnumTreeItemType {
		return EnumTreeItemType.Item
	}

	/**
	 * `disposed` status of this item
	 *
	 * Once an item is disposed, it's best to let go of all references to it to avoid any memory leaks
	 */
	get disposed() { return this._disposed }

	/**
	 * Hierarchial depth of this item relative to the `BirchRoot`
	 */
	get depth() { return this._depth }
	get root() { return this._root }
	get parent() { return this._parent }
	get id() { return this._uid }
	get label() { return this._label }
	get tid() { return this._tid }
	get details() { return this._details }

	/**
	 * Full absolute path of this item
	 */
	get path(): string {
		if (!this.resolvedPathCache) {
			this.resolvedPathCache = this.root.pathfx.join(this.parent.path, this.label)
		}
		return this.resolvedPathCache
	}

	/**
	 * Very much like `unix`s `mv` command
	 *
	 * Calling this method directly WILL NOT trigger `onWillHandleWatchEvent` and `onDidHandleWatchEvent` events
	 *
	 * Prefer using `BirchRoot#inotify` instead
	 */
	public mv(to: BirchFolder, fname: string = this.label) {
		const prevParent = this._parent
		if (to === null || to.type !== EnumTreeItemType.Folder) { 
			this._parent = null
			prevParent.unlinkItem(this)
			this.dispose()
			return
		}
		const didChangeParent = prevParent !== to
		const prevPath = this.path

		this.resolvedPathCache = null
		this._depth = to._depth + 1

		if (didChangeParent || fname !== this.label /* change in filename means change in sort order */) {
			this._label = fname
			if (didChangeParent) {
				this._superv.notifyWillChangeParent(this, prevParent, to)
			}
			this._parent.unlinkItem(this, true)
			this._parent = to
			this._parent.insertItem(this)
			if (didChangeParent) {
				this._superv.notifyDidChangeParent(this, prevParent, to)
			}
		}

		if (this.path !== prevPath) {
			this._superv.notifyDidChangePath(this)
		}
	}

	protected async didChangeItem() {
		const newItem = await this.root.host.getTreeItem(this)
		this._label = newItem.label
	}

	protected dispose() {
		if (this._disposed) { return }
		this._superv.notifyWillDispose(this)
		this._disposed = true
		BirchItem.idToItemEntry.delete(this._uid)
		this._superv.notifyDidDispose(this)
	}
}
