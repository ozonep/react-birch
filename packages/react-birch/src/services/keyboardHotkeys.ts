import {  BirchItem, BirchFolder } from '../models'
import { ITreeViewExtendedHandle, EnumTreeViewExtendedEvent, EnumTreeItemType } from '../types'
import * as React from 'react'

export class KeyboardHotkeys {
    private hotkeyActions = {
        'ArrowUp': () => this.jumpToPrevItem(),
        'ArrowDown': () => this.jumpToNextItem(),
        'ArrowRight': () => this.expandOrJumpToFirstChild(),
        'ArrowLeft': () => this.collapseOrJumpToFirstParent(),
        'Space': () => this.toggleFolderExpand(),
        'Enter': () => this.selectItemOrToggleDirState(),
        'Home': () => this.jumpToFirstItem(),
        'End': () => this.jumpToLastItem(),
        'F2': () => this.triggerRename(),
        'Escape': () => this.resetSteppedOrSelectedItem(),
    }

    constructor(private readonly treeViewHandleExtended: React.MutableRefObject<ITreeViewExtendedHandle>) { }

    public handleKeyDown = (ev: React.KeyboardEvent) => {
        if (!this.treeViewHandleExtended.current.hasDirectFocus()) {
            return false
        }
        const { code } = ev.nativeEvent
        if (code in this.hotkeyActions) {
            ev.preventDefault()
            this.hotkeyActions[code]()
            return true
        }
    }

    private jumpToFirstItem = (): void => {
        const { root } = this.treeViewHandleExtended.current.getModel()
        this.treeViewHandleExtended.current.setPseudoActiveItem(root.getItemEntryAtIndex(0))
    }

    private jumpToLastItem = (): void => {
        const { root } = this.treeViewHandleExtended.current.getModel()
        this.treeViewHandleExtended.current.setPseudoActiveItem(root.getItemEntryAtIndex(root.branchSize - 1))
    }

    private jumpToNextItem = (): void => {
        const { root } = this.treeViewHandleExtended.current.getModel()
        let currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (!currentPseudoActive) {
            const selectedItem = this.treeViewHandleExtended.current.getActiveItem()
            if (selectedItem) {
                currentPseudoActive = selectedItem
            } else {
                return this.jumpToFirstItem()
            }
        }
        const idx = root.getIndexAtItemEntry(currentPseudoActive)
        if (idx + 1 > root.branchSize) {
            return this.jumpToFirstItem()
        } else if (idx > -1) {
            this.treeViewHandleExtended.current.setPseudoActiveItem(root.getItemEntryAtIndex(idx + 1))
        }
    }

    private jumpToPrevItem = (): void => {
        const { root } = this.treeViewHandleExtended.current.getModel()
        let currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (!currentPseudoActive) {
            const selectedItem = this.treeViewHandleExtended.current.getActiveItem()
            if (selectedItem) {
                currentPseudoActive = selectedItem
            } else {
                return this.jumpToLastItem()
            }
        }
        const idx = root.getIndexAtItemEntry(currentPseudoActive)
        if (idx - 1 < 0) {
            return this.jumpToLastItem()
        } else if (idx > -1) {
            this.treeViewHandleExtended.current.setPseudoActiveItem(root.getItemEntryAtIndex(idx - 1))
        }
    }

    private expandOrJumpToFirstChild(): void {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (currentPseudoActive && currentPseudoActive.type === EnumTreeItemType.Folder) {
            if ((currentPseudoActive as BirchFolder).expanded) {
                return this.jumpToNextItem()
            } else {
                this.treeViewHandleExtended.current.openFolder(currentPseudoActive as BirchFolder)
            }
        }
    }

    private collapseOrJumpToFirstParent(): void {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (currentPseudoActive) {
            if (currentPseudoActive.type === EnumTreeItemType.Folder && (currentPseudoActive as BirchFolder).expanded) {
                return this.treeViewHandleExtended.current.closeFolder(currentPseudoActive as BirchFolder)
            }
            this.treeViewHandleExtended.current.setPseudoActiveItem(currentPseudoActive.parent)
        }
    }

    private triggerRename(): void {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (currentPseudoActive) {
            this.treeViewHandleExtended.current.rename(currentPseudoActive)
        }
    }

    private selectItemOrToggleDirState = (): void => {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (!currentPseudoActive) { return }
        if (currentPseudoActive.type === EnumTreeItemType.Folder) {
            this.treeViewHandleExtended.current.toggleFolder(currentPseudoActive as BirchFolder)
        } else if (currentPseudoActive.type === EnumTreeItemType.Item) {
            this.treeViewHandleExtended.current.setActiveItem(currentPseudoActive as BirchItem)
            this.treeViewHandleExtended.current.events.emit(EnumTreeViewExtendedEvent.OnDidChangeSelection, currentPseudoActive as BirchItem)
        }
    }

    private toggleFolderExpand = (): void => {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (!currentPseudoActive) { return }
        if (currentPseudoActive.type === EnumTreeItemType.Folder) {
            this.treeViewHandleExtended.current.toggleFolder(currentPseudoActive as BirchFolder)
        }
    }

    private resetSteppedOrSelectedItem = (): void => {
        const currentPseudoActive = this.treeViewHandleExtended.current.getPseudoActiveItem()
        if (currentPseudoActive) {
            return this.resetSteppedItem()
        }
        this.treeViewHandleExtended.current.setActiveItem(null)
    }

    private resetSteppedItem = () => {
        this.treeViewHandleExtended.current.setPseudoActiveItem(null)
    }
}
