
import * as React from 'react'

import { useMemo, useCallback } from 'react';

import {
    BirchItem,
    BirchFolder,
    EnumBirchWatchEvent,
    BirchItemOrFolder,
} from '../models'

import { DragAndDropService } from '../services/dragAndDrop'

import {
    EnumBirchItemType, IContext,
} from '../types'

import { useContext } from 'react'
import { ThemeContext } from 'styled-components'

function useTheme() {
  return useContext(ThemeContext)
}

export const useDragDropContainer = (context: IContext) => {

    const {props: { options: {treeDataProvider}}, activeSelection: {updateActiveItem, updatePseudoActiveItem},  model} = context

    const [ dragged, setDragged ] = React.useState(false)

    const dragAndDropService = useMemo(() => new DragAndDropService(model.current), [model])

    useMemo(() => dragAndDropService.onDragAndDrop(async (item: BirchItemOrFolder, newParent: BirchFolder) => {
        try {
            const newPath = model.current.root.pathfx.join(newParent.path, item.label)
            await treeDataProvider.moveItem(item, newParent, newPath)
            model.current.root.inotify({
                type: EnumBirchWatchEvent.Moved,
                tid: item.tid,
                oldPath: item.path,
                newPath: newPath,
            })
            updatePseudoActiveItem(null)
            updateActiveItem(item)
            setDragged(dragged => !dragged)
        } catch (error) {
            // handle as you see fit
        }
    }), [model])

    context.dragDrop = { dragAndDropService, dragged }

}

export const useDragDropChild = ({itemIdToRefMap, item, itemType, dragAndDropService }) => {

    const theme: any = useTheme()

    const handleDragStart = useCallback((ev: React.DragEvent) => {

        if (
            itemType === EnumBirchItemType.BirchItem ||
            itemType === EnumBirchItemType.BirchFolder
        ) {

            const ref = itemIdToRefMap.get(item.id)

            if (ref) {

                ref.style.backgroundColor = 'none'
                const label$ = ref.querySelector('.birch-label') as HTMLDivElement
                label$.style.padding = '2px 8px'
                label$.style.background = theme.colors.accent[3]
                label$.style.color = theme.colors.gray[7]
                label$.style.borderRadius = '1em'
                label$.style.fontSize = theme.fontSizes[0] + 'px'
                label$.style.transform = 'translate(0, 0)' // fixes chrome rounded corners transparent background

                ev.dataTransfer.setDragImage(label$, -5, -5)

                requestAnimationFrame(() => {
                    ref.style.background = ''
                    ref.style.borderRadius = ''
                    label$.style.padding = ''
                    label$.style.background = ''
                    label$.style.borderRadius = ''
                    label$.style.color = ''
                    label$.style.fontSize = ''
                    label$.style.transform = ''
                    label$.style.cursor = 'pointer'
                })
            }
            dragAndDropService.handleDragStart(ev, item as BirchItem)
        }
    }, [item, itemType, dragAndDropService])

    const handleDragEnd = useCallback((ev: React.DragEvent) => {

        if (
            itemType === EnumBirchItemType.BirchItem ||
            itemType === EnumBirchItemType.BirchFolder
        ) {
            dragAndDropService.handleDragEnd(ev, item as BirchItem)
        }
    }, [item, itemType, dragAndDropService])

    const handleDragEnter = useCallback((ev: React.DragEvent) => {
        if (
            itemType === EnumBirchItemType.BirchItem ||
            itemType === EnumBirchItemType.BirchFolder
        ) {
            dragAndDropService.handleDragEnter(ev, item as BirchItem)
        }
    }, [item, itemType, dragAndDropService])

    const handleDrop = useCallback((ev: React.DragEvent) => {
        if (
            itemType === EnumBirchItemType.BirchItem ||
            itemType === EnumBirchItemType.BirchFolder
        ) {
            dragAndDropService.handleDrop(ev)
        }
    }, [itemType, dragAndDropService])

    const handleDragOver = useCallback((ev: React.DragEvent) => {
        if (
            itemType === EnumBirchItemType.BirchItem ||
            itemType === EnumBirchItemType.BirchFolder
        ) {
            dragAndDropService.handleDragOver(ev)
        }
    }, [itemType, dragAndDropService])

    const dragProps = useMemo(() => ({ 
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
    }), [item, itemType, dragAndDropService])

    return [ dragProps ]

}
