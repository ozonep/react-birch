import { IDisposable, EventEmitter } from 'birch-event-emitter'
import { IBirchCoreHost, BirchFolder, BirchRoot  } from '../../models'
import { DecorationsManager } from '../decoration'
import { ITreeViewOptions } from '../../types'

enum TreeStateEvent {
	DidBranchUpdate = 1,
	DidChangeScrollOffset = 1,
	DidChangeFolderExpansionState,
	DidChangeRelativePath,
	DidChange
}

export class TreeViewModel {
	
	public readonly root: BirchRoot
	public readonly decorations: DecorationsManager

	private events: EventEmitter<TreeStateEvent> = new EventEmitter()
	private expandedFolders: Map<BirchFolder, string> = new Map()
	private _scrollOffset: number = 0

	constructor({options}: {options: ITreeViewOptions<any>}) {

        const host: IBirchCoreHost<any> = Object.assign({}, options.treeDataProvider, {
            pathStyle: 'unix' as any,
            watch: options.treeDataProvider.watch,
        })
		
		this.root = new BirchRoot(host, options.rootPath)
		this.root.onDidChangeFolderExpansionState(this.handleExpansionChange)
		this.root.onDidChangePath(this.handleDidChangePath)
		this.events = new EventEmitter()

		this.root.onDidBranchUpdate(this.dispatchChange)

        this.decorations = new DecorationsManager(this.root as any)

    }

	public onDidBranchUpdate(callback: () => void): IDisposable {
		return this.events.on(TreeStateEvent.DidBranchUpdate, callback)
	}

	private dispatchChange = () => {
		this.events.emit(TreeStateEvent.DidBranchUpdate)
	}

	get scrollOffset() {
		return this._scrollOffset
	}

	public saveScrollOffset(scrollOffset: number) {
		this._scrollOffset = scrollOffset
		this.events.emit(TreeStateEvent.DidChangeScrollOffset, scrollOffset)
	}

	public onChangeScrollOffset(callback: (newOffset: number) => void): IDisposable {
		return this.events.on(TreeStateEvent.DidChangeScrollOffset, callback)
	}

	public onDidChangeFolderExpansionState(callback: (relDirPath: string, nowExpanded: boolean, visibleAtSurface: boolean) => void): IDisposable {
		return this.events.on(TreeStateEvent.DidChangeFolderExpansionState, callback)
	}

	public onDidChangeRelativePath(callback: (prevPath: string, newPath: string) => void): IDisposable {
		return this.events.on(TreeStateEvent.DidChangeRelativePath, callback)
	}

	private handleExpansionChange = (target: BirchFolder, isExpanded: boolean, isVisibleAtSurface: boolean) => {
	
		let relativePath = this.expandedFolders.get(target)

		if (isExpanded && !relativePath) {
			relativePath = this.root.pathfx.relative(this.root.path, target.path)
			this.expandedFolders.set(target, relativePath)
			this.events.emit(TreeStateEvent.DidChangeFolderExpansionState, relativePath, isExpanded, isVisibleAtSurface)
		} else if (!isExpanded && relativePath) {	
			this.expandedFolders.delete(target)
			this.events.emit(TreeStateEvent.DidChangeFolderExpansionState, relativePath, isExpanded, isVisibleAtSurface)
		}

	}

	private handleDidChangePath = (target: BirchFolder) => {
		if (this.expandedFolders.has(target)) {
			const prevPath = this.expandedFolders.get(target)
			const newPath = this.root.pathfx.relative(this.root.path, target.path)
			this.expandedFolders.set(target, newPath)
			this.events.emit(TreeStateEvent.DidChangeRelativePath, prevPath, newPath)
		}
	}

}

