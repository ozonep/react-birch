import { useContextMenu as UseContextMenuBase, IPosition } from 'birch-context-menu'
import { BirchItem, BirchFolder } from '../models';
import { ITreeViewExtendedHandle } from '../types';

export function useContextMenu() {

    const { showContextMenu } = UseContextMenuBase()

    return [(
        ev: React.MouseEvent,
        contextMenus: {
            command: string,
            title: string,
            icon?: string,
            when: (item: any) => boolean,
            group: string,
            onClick: (view: ITreeViewExtendedHandle, item: any) => void
        }[],
        treeViewHandleExtended: ITreeViewExtendedHandle,
        item: BirchItem | BirchFolder,
        pos?: IPosition,
    ) => {

        if (pos) {
            ev.preventDefault()
        }

        const menusByGroup = contextMenus
            .filter(m => m.when(item))
            .map(m => ({
                label: m.title,
                group: m.group,
                onClick: m.onClick.bind(null, treeViewHandleExtended, item)
            }))
            .reduce(function (rv, x) {
                (rv[x.group] = rv[x.group] || []).push(x);
                return rv;
            }, {})

        const menus = Object.keys(menusByGroup).map(k => menusByGroup[k])

        if (menus.length > 0) {
            showContextMenu(menus as any, pos)
        } else {
            console.log("no context menu")
        }
    }]

}

const groupBy = function (xs: any[], key: string) {
    return xs
};
