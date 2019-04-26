import * as React from 'react'
import { useRef, useCallback } from 'react';

import {
    BirchFolder,
    BirchItem,
    BirchItemOrFolder,
} from '../models'

import {
    EnumBirchItemType,
    EnumTreeViewExtendedEvent,
    IContext,
} from '../types'

import { DecorationTargetMatchMode } from '../models/decoration'
import { KeyboardHotkeys } from '../services/keyboardHotkeys'

export const useActiveSelection = (context: IContext) => {
    const {
        model,
        forceUpdate,
        treeViewHandleExtended,
        decorations: { activeItemDecoration, pseudoActiveItemDecoration }
    } = context

    const activeItem = useRef<BirchItemOrFolder>()
    const pseudoActiveItem = useRef<BirchItemOrFolder>()
    const keyboardHotkeys = useRef<KeyboardHotkeys>(new KeyboardHotkeys(treeViewHandleExtended))

    const updateActiveItem = useCallback(async (fileOrDirOrPath: BirchItemOrFolder | string): Promise<void> => {
        const fileH = typeof fileOrDirOrPath === 'string'
            ? await treeViewHandleExtended.current.getItemHandle(fileOrDirOrPath)
            : fileOrDirOrPath

        if (fileH === model.current.root) { return }
        if (activeItem.current !== fileH) {
            if (activeItem.current) {
                activeItemDecoration.current.removeTarget(activeItem.current)
            }
            if (fileH) {
                activeItemDecoration.current.addTarget(fileH as any, DecorationTargetMatchMode.Self)
            }
            activeItem.current = fileH
            forceUpdate()
        }
        if (fileH) {
            await treeViewHandleExtended.current.ensureVisible(fileH)
        }
    }, [])

    const updatePseudoActiveItem = useCallback(async (fileOrDirOrPath: BirchItemOrFolder | string): Promise<void> => {
        const fileH = typeof fileOrDirOrPath === 'string'
            ? await treeViewHandleExtended.current.getItemHandle(fileOrDirOrPath)
            : fileOrDirOrPath

        if (fileH === model.current.root) { return }
        if (pseudoActiveItem.current !== fileH) {
            if (pseudoActiveItem.current) {
                pseudoActiveItemDecoration.current.removeTarget(pseudoActiveItem.current)
            }
            if (fileH) {
                pseudoActiveItemDecoration.current.addTarget(fileH as any, DecorationTargetMatchMode.Self)
            }
            pseudoActiveItem.current = fileH
            forceUpdate()
        }
        if (fileH) {
            await treeViewHandleExtended.current.ensureVisible(fileH)
        }
    }, [])

    const handleBlur = useCallback(() => {
        treeViewHandleExtended.current.events.emit(EnumTreeViewExtendedEvent.OnBlur)
    }, [])

    const handleItemClicked = useCallback((ev: React.MouseEvent, item: BirchItemOrFolder, type: EnumBirchItemType) => {
        if (type === EnumBirchItemType.BirchItem) {
            updateActiveItem(item as BirchItem)
            updatePseudoActiveItem(null)
            item.details.command && (item as BirchItem).details.command.onClick(item)
            treeViewHandleExtended.current.events.emit(EnumTreeViewExtendedEvent.OnDidChangeSelection, item as BirchItem)
        }
        if (type === EnumBirchItemType.BirchFolder) {
            updatePseudoActiveItem(item as BirchItem)
            updateActiveItem(null)
            treeViewHandleExtended.current.toggleFolder(item as BirchFolder)
        }
    }, [])


    const handleClick = useCallback((ev: React.MouseEvent) => {
        // clicked in "blank space"
        if (ev.currentTarget === ev.target) {
            updatePseudoActiveItem(null)
        }
    }, [])

    const handleKeyDown = useCallback((ev: React.KeyboardEvent) => {
        return keyboardHotkeys.current.handleKeyDown(ev)
    }, [])

    const selectionProps = {
        onKeyDown: handleKeyDown,
        onBlur: handleBlur,
        onClick: handleClick
    }

    context.activeSelection = {
        activeItem,
        pseudoActiveItem,
        updateActiveItem,
        updatePseudoActiveItem,
        handleKeyDown,
        selectionProps,
        handleItemClicked
    }

}
