import * as vscode from 'vscode'
import * as path from 'path'

import { getAllBookmarks, pathResolve } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { ItemMarkJson } from '../model'

export class FavouriteMarkProvider implements vscode.TreeDataProvider<MarkResource> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MarkResource | void>()
  readonly onDidChangeTreeData: vscode.Event<MarkResource | void> = this._onDidChangeTreeData.event
  private _onDidExpandElement = new vscode.EventEmitter<MarkResource | void>()
  readonly onDidExpandElement: vscode.Event<MarkResource | void> = this._onDidExpandElement.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: MarkResource): vscode.TreeItem {
    return element
  }

  getChildren(): MarkResource[] {
    const bookmarks = this.getSortedFavouriteResources()
    if (!bookmarks || !bookmarks.length) {
      return []
    }
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP

    const filterData = bookmarks.filter((i) => i.group === currentGroup)
    const rootResources = this.data2Resource(filterData, 'mark')
    return rootResources
  }

  private getSortedFavouriteResources(): Array<ItemMarkJson> {
    const allBookmarks = getAllBookmarks()
    const sort = configMgr.get('markSortOrder') as string

    if (sort === 'MANUAL') {
      return allBookmarks
    }

    const data = this.sortResources(
      allBookmarks.map((item) => item),
      sort
    )
    return data
  }

  private sortResources(bookmarks: Array<ItemMarkJson>, sort: string): Array<ItemMarkJson> {
    const isAsc = sort === 'ASC'
    bookmarks.sort(function (a, b) {
      const aName = path.basename(a.filePath)
      const bName = path.basename(b.filePath)

      if (aName < bName) {
        return isAsc ? -1 : 1
      }
      return aName === bName ? 0 : isAsc ? 1 : -1
    })
    return bookmarks
  }

  private data2Resource(data: Array<ItemMarkJson>, contextValue: string): Array<MarkResource> {
    const allResource = []
    data.forEach(i => {
      const uri = vscode.Uri.file(pathResolve(i.filePath));
      i.bookmarks.forEach(bb => {
        const markResource = new MarkResource(
          bb.content,
          i.filePath,
          contextValue,
          {
            command: 'favourite.markOpen',
            title: '',
            arguments: [uri, bb.lineNumber],
          },
          uri,
          bb.lineNumber
        )
        allResource.push(markResource)
      })
    })
    return allResource
  }
}

export class MarkResource extends vscode.TreeItem {
  public resourceUri: vscode.Uri

  constructor(
    public label: string,
    public value: string,
    public contextValue: string,
    public command?: vscode.Command,
    public uri?: vscode.Uri,
    public lineNumber?: number
  ) {
    super(label)

    this.resourceUri = uri ? uri : vscode.Uri.file(value)
    this.tooltip = value
  }
}