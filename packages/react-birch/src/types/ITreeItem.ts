import { ITreeViewExtendedHandle } from "./ITreeViewExtendedHandle";

export enum EnumTreeItemType {
	Item = 1,
	Folder,
}

declare class Uri {
    static parse(value: string, strict?: boolean): Uri;
    static file(path: string): Uri;
    private constructor(scheme: string, authority: string, path: string, query: string, fragment: string);
    readonly scheme: string;
    readonly authority: string;
    readonly path: string;
    readonly query: string;
    readonly fragment: string;
    readonly fsPath: string;
    with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri;
    toString(skipEncoding?: boolean): string;
    toJSON(): any;
}

/**
 * Collapsible state of the tree item
 */
export enum EnumTreeItemCollapsibleState {

    /**
     * Determines an item can be neither collapsed nor expanded. Implies it has no children.
     */
    None = 0,

    /**
     * Determines an item is collapsed
     */
    Collapsed = 1,
    
    /**
     * Determines an item is expanded
     */
    Expanded = 2
}

export declare interface ITreeItemRaw {

    /**
     * A human-readable string describing this item. When `falsy`, it is derived from [resourceUri](#ITreeItem.resourceUri).
     */
    label?: string;

    /**
     * Optional id for the tree item that has to be unique across tree. The id is used to preserve the selection and expansion state of the tree item.
     *
     * If not provided, an id is generated using the tree item's path. 
     */
    tid?: string;

    /**
     * Whether this item has children (Folder) or is only a child leaf (Item)
     */
    type: EnumTreeItemType

}

export declare interface ITreeItemExtended {

    /**
     * A human-readable path to this item. 
     */
    path: string;

    /**
     * A human-readable path to this item. 
     */
    parent: ITreeItemExtendedFolder;

    /**
     * Remove child
     */
    unlinkItem?: (item: ITreeItemExtended) => void

    /**
     * A human-readable string describing this item. When `falsy`, it is derived from [resourceUri](#ITreeItem.resourceUri).
     */
    label: string;

    /**
     * Optional id for the tree item that has to be unique across tree. The id is used to preserve the selection and expansion state of the tree item.
     *
     * If not provided, an id is generated using the tree item's path. 
     */
    tid?: string;

    /**
     * Whether this item has children (Folder) or is only a child leaf (Item)
     */
    type: EnumTreeItemType

}

export declare interface ITreeItemExtendedFolder extends ITreeItemExtended {

    /**
     * Remove child
     */
    unlinkItem: (item: ITreeItemExtended) => void

}


export interface Command {

    /**
     * Title of the command, like `save`.
     */
    title: string;

    /**
     * The identifier of the actual command handler.
     * @see [commands.registerCommand](#commands.registerCommand).
     */
    command: string;

    onClick?: (item: ITreeItemExtended) => void;

    /**
     * A tooltip for the command, when represented in the UI.
     */
    tooltip?: string;

    /**
     * Arguments that the command handler should be
     * invoked with.
     */
    arguments?: any[];
}


/**
 * A reference to a named icon. Currently only [ItemIcon](#ThemeIcon.ItemIcon) and [FolderIcon](#ThemeIcon.FolderIcon) are supported.
 * Using a theme icon is preferred over a custom icon as it gives theme authors the possibility to change the icons.
 */
export declare class ThemeIcon {
    /**
     * Reference to a icon representing a item. The icon is taken from the current item icon theme or a placeholder icon.
     */
    static readonly ItemIcon: ThemeIcon;

    /**
     * Reference to a icon representing a folder. The icon is taken from the current item icon theme or a placeholder icon.
     */
    static readonly FolderIcon: ThemeIcon;

    private constructor(id: string);
}

export declare class ITreeItem implements ITreeItemRaw {

    /**
     * A human-readable string describing this item. When `falsy`, it is derived from [resourceUri](#ITreeItem.resourceUri).
     */
    label?: string;

    /**
     * Optional id for the tree item that has to be unique across tree. The id is used to preserve the selection and expansion state of the tree item.
     *
     * If not provided, an id is generated using the tree item's path. 
     */
    tid?: string;

    /**
     * Whether this item has children (Folder) or is only a child leaf (Item)
     */
    type: EnumTreeItemType

    /**
     * The icon path or [ThemeIcon](#ThemeIcon) for the tree item.
     * When `falsy`, [TreeFolder Theme Icon](#ThemeIcon.TreeFolder) is assigned, if item is collapsible otherwise [ITreeItem Theme Icon](#ThemeIcon.ITreeItem).
     * When a [ThemeIcon](#ThemeIcon) is specified, icon is derived from the current item icon theme for the specified theme icon using [resourceUri](#ITreeItem.resourceUri) (if provided).
     */
    iconPath?: string | Uri | { light: string | Uri; dark: string | Uri } | ThemeIcon;

    /**
     * A human readable string which is rendered less prominent.
     * When `true`, it is derived from [resourceUri](#ITreeItem.resourceUri) and when `falsy`, it is not shown.
     */
    description?: string | boolean;

    /**
     * The [uri](#Uri) of the resource representing this item.
     *
     * Will be used to derive the [label](#ITreeItem.label), when it is not provided.
     * Will be used to derive the icon from current icon theme, when [iconPath](#ITreeItem.iconPath) has [ThemeIcon](#ThemeIcon) value.
     */
    resourceUri?: Uri;

    /**
     * The tooltip text when you hover over this item.
     */
    tooltip?: string | undefined;

    /**
     * The [command](#Command) that should be executed when the tree item is selected.
     */
    command?: Command;

    /**
     * [EnumTreeItemCollapsibleState](#EnumTreeItemCollapsibleState) of the tree item.
     */
    collapsibleState?: EnumTreeItemCollapsibleState;

    /**
     * Context value of the tree item. This can be used to contribute item specific actions in the tree.
     * For example, a tree item is given a context value as `folder`. When contributing actions to `view/item/context`
     * using `menus` extension point, you can specify context value for key `viewItem` in `when` expression like `viewItem == folder`.
     * ```
     *	"contributes": {
     *		"menus": {
     *			"view/item/context": [
     *				{
     *					"command": "extension.deleteFolder",
     *					"when": "viewItem == folder"
     *				}
     *			]
     *		}
     *	}
     * ```
     * This will show action `extension.deleteFolder` only for items with `contextValue` is `folder`.
     */
    contextValue?: string;

    /**
     * @param label A human-readable string describing this item
     * @param collapsibleState [EnumTreeItemCollapsibleState](#EnumTreeItemCollapsibleState) of the tree item. Default is [EnumTreeItemCollapsibleState.None](#EnumTreeItemCollapsibleState.None)
     */
    constructor(label: string, collapsibleState?: EnumTreeItemCollapsibleState);

    /**
     * @param resourceUri The [uri](#Uri) of the resource representing this item.
     * @param collapsibleState [EnumTreeItemCollapsibleState](#EnumTreeItemCollapsibleState) of the tree item. Default is [EnumTreeItemCollapsibleState.None](#EnumTreeItemCollapsibleState.None)
     */
    constructor(resourceUri: Uri, collapsibleState?: EnumTreeItemCollapsibleState);

}
