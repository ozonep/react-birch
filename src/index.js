import * as React from 'react';

import Filer from 'filer';
import {ContextMenuProvider, ContextMenu} from 'birch-context-menu';
import {render} from 'react-dom';
import theme from './themes/light'
import {ThemeProvider} from 'styled-components'

import {
    EnumTreeItemType,
    TreeView,
    ITEM_HEIGHT,
    TreeViewItemStyled
} from 'react-birch';

import {initFS} from './filerfs'
import Icon, {Trashcan} from '@githubprimer/octicons-react'

const Path = Filer.Path;
import {SidePanel} from './components/SidePanel'


let fid = 0;
(async () => {
    const MOUNT_POINT = '/app';
    const fs = await initFS(MOUNT_POINT);
    const treeDataProvider = {
        getChildren: async ({path, tid}) => {
            return await Promise.all(
                (await fs.readdir(path))
                    .map(async (filename) => {
                        const stat = await fs.stat(Path.join(path, filename));
                        return {
                            filename,
                            type: stat.isDirectory() ? EnumTreeItemType.Folder : EnumTreeItemType.Item
                        }
                    }))
        },
        getTreeItem: (element) => {
            return {
                label: element.filename,
                tid: element.tid || `${(fid++).toString()}`,
                type: element.type,
                command: element.type == EnumTreeItemType.Folder ? undefined : {
                    command: 'explorer.showItem',
                    onClick: (item) => {
                        console.log("onShowItem", item.path)
                    },
                    arguments: [element.tid],
                    title: 'Open Document'
                }
            }

        },
        onDidChangeTreeData: (handler) => {
            console.log("registered onDidChangeTreeData");
            //   setTimeout(async () => {
            //       await fs.mv("/app/package.json", "/app/thenewpackage.json");
            //       handler({
            //           tid: '1',
            //           filename: 'thenewpackage.json',
            //           type: EnumTreeItemType.Item
            //       })
            //   }, 1000);
            // return () => undefined
        },

        // used by `TreeView` for when user hits `Enter` key in a new item prompt
        createItem: async (parent, label, pathToNewObject, fileType) => {
            try {
                const {path: parentPath, tid: parentTid} = parent;
                if (fileType === EnumTreeItemType.Item) {
                    await fs.writeFile(pathToNewObject)
                } else {
                    await fs.mkdir(pathToNewObject)
                }
                const result = {
                    label,
                    type: fileType,
                    tid: `${(fid++).toString()}`
                };
                console.log("onCreateItem", {parentPath, parentTid, pathToNewObject}, result);
                return result
            } catch (error) {
                return null
            }
        },

        // used by `TreeView` for drag and drop, and rename prompts
        moveItem: async (item, newParent, newPath) => {
            try {
                const {path: oldPath, tid} = item;
                console.log("onMoveItem", {path: oldPath, tid}, newPath);
                await fs.mv(oldPath, newPath);
                return true
            } catch (error) {
                return false
            }
        },
        watch: undefined
    };

    const contributes = {
        titleMenus: [
            {
                command: "explorer.newItem",
                title: "Add new item",
                onClick: (view) => {
                    const item = view.getPseudoActiveItem() || view.getModel().root;
                    if (item.type === EnumTreeItemType.Folder) {
                        view.newItem(item.path)
                    } else {
                        view.newItem(item.parent.path)
                    }
                },
                icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='13 2 8 2 6 2 6 0 2 0 2 2 0 2 0 6 2 6 2 8 4 8 4 16 16 16 16 5' fill='%23F6F6F6'/%3E%3Cpolygon points='12 3 8 3 8 4 11 4 11 7 14 7 14 14 6 14 6 8 5 8 5 15 15 15 15 6' fill='%23424242'/%3E%3Cpath d='m7 3.018h-2v-2.018h-1.981v2.018h-2.019v1.982h2.019v2h1.981v-2h2v-1.982z' fill='%23388A34'/%3E%3Cpolygon points='11 7 11 4 8 4 8 6 6 6 6 8 6 14 14 14 14 7' fill='%23F0EFF1'/%3E%3C/svg%3E%0A\")"
            },
            {
                command: "explorer.newFolder",
                title: "Add new folder",
                onClick: (view) => {
                    const item = view.getPseudoActiveItem() || view.getModel().root;
                    if (item.type === EnumTreeItemType.Folder) {
                        view.newFolder(item.path)
                    } else {
                        view.newFolder(item.parent.path)
                    }
                },
                icon: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpolygon points='9,3 8,5 8,2 6,2 6,0 2,0 2,2 0,2 0,6 2,6 2,8 2,15 16,15 16,3' fill='%23F6F6F6'/%3E%3Cpath d='M14 4h-4.382l-1 2h-2.618v2h-3v6h12v-10h-1zm0 2h-3.882l.5-1h3.382v1z' fill='%23656565'/%3E%3Cpolygon points='7,3.018 5,3.018 5,1 3.019,1 3.019,3.018 1,3.018 1,5 3.019,5 3.019,7 5,7 5,5 7,5' fill='%23388A34'/%3E%3Cpolygon points='14,5 14,6 10.118,6 10.618,5' fill='%23F0EFF1'/%3E%3C/svg%3E\")"
            },
            {
                command: "explorer.collapseAll",
                title: "Collapse all",
                onClick: (view) => {
                    view.collapseAll()
                },
                icon: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='-1 0 16 16' enable-background='new -1 0 16 16'%3E%3Cpath fill='%23424242' d='M14 1v9h-1v-8h-8v-1h9zm-11 2v1h8v8h1v-9h-9zm7 2v9h-9v-9h9zm-2 2h-5v5h5v-5z'/%3E%3Crect x='4' y='9' fill='%2300539C' width='3' height='1'/%3E%3C/svg%3E\")"
            },

        ],
        itemMenus: [
            {
                command: "explorer.delete",
                title: "Delete",
                onClick: (item) => {
                    const {path, tid} = item
                    console.log("deleted", {path, tid});
                    item.parent.unlinkItem(item)
                },
                when: (item) => {
                    return true
                },
                icon: <Icon verticalAlign="middle" size="small" icon={Trashcan}/>
            }
        ],
        contextMenus: [
            {
                command: "explorer.newitem",
                title: 'New Item',
                group: "1",
                onClick: (view, item) => {
                    view.newItem(item)
                },
                when: (item) => item.type === EnumTreeItemType.Folder
            },
            {
                command: "explorer.newfolder",
                title: 'New Folder',
                group: "1",
                onClick: (view, item) => {
                    view.newFolder(item)
                },
                when: (item) => item.type === EnumTreeItemType.Folder
            },
            {
                command: "explorer.renameitem",
                title: 'Rename',
                group: "2",
                onClick: (view, item) => {
                    view.rename(item)
                },
                when: (item) => true
            }
        ],
        keybindings: [],
    };

    const onCreateView = (view) => {
        console.log("onCreateView");
        view.onDidChangeSelection((e) => {
            console.log("onDidChangeSelection", e)
        });
        view.onDidChangeVisibility((e) => {
            console.log("onDidChangeVisibility", e)
        });
        view.onDidCollapseElement((e) => {
            console.log("onDidCollapseElement", e)
        });
        view.onDidExpandElement((e) => {
            console.log("onDidExpandElement", e)
        })
    };

    render(
        <ThemeProvider theme={theme}>
            <ContextMenuProvider>
                <SidePanel>
                    <ContextMenu/>
                    <TreeView
                        title="WORKSPACE"
                        viewId="explorer"
                        children={TreeViewItemStyled}
                        options={{
                            treeDataProvider,
                            rootPath: MOUNT_POINT,
                            itemHeight: ITEM_HEIGHT,
                            contributes,
                            onCreateView,
                        }}
                    />
                </SidePanel>
            </ContextMenuProvider>
        </ThemeProvider>
        , document.getElementById('root'));
})();