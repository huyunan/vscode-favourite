import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

import { getCurrentResources, pathResolve } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP, FileStat } from '../enum'
import { Item, ItemInSettingsJson } from '../model'

export class FavouriteMarkProvider implements vscode.TreeDataProvider<Resource> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Resource | void>()
  readonly onDidChangeTreeData: vscode.Event<Resource | void> = this._onDidChangeTreeData.event
  private _onDidExpandElement = new vscode.EventEmitter<Resource | void>()
  readonly onDidExpandElement: vscode.Event<Resource | void> = this._onDidExpandElement.event

  // Use for detecting doubleclick
  public lastOpened: { uri: vscode.Uri; date: Date }
  public itemMap: Map<string, {value: Resource, resource: Resource[]}> = new Map();

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element
  }

  getChildren(element?: Resource, expandFlg?: boolean): Resource[] {
    const resources = this.getSortedFavouriteResources()
    if (!resources || !resources.length) {
      return []
    }
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP

    if (!element) {
      // 初始化，清空 itemMap
      if (!expandFlg) this.itemMap = new Map()
      const resourcesStats = resources.map((r) => this.getResourceStat(r))
    
      const filterData = resourcesStats.filter((i) => i.stat !== FileStat.NEITHER && i.group === currentGroup)
      const rootResources = this.data2Resource(filterData, 'resource')
      this.itemMap.set(element?.value, {value: undefined, resource: rootResources})
      return rootResources
    }

    return this.getChildrenResources({ filePath: element.value, group: currentGroup }, element)
  }

  private getChildrenResources(item: ItemInSettingsJson, element: Resource): Array<Resource> {
    const sort = configMgr.get('markSortOrder') as string
    const childrenStat = this.getResourceStat(item)
    if (childrenStat.stat == FileStat.DIRECTORY) {
      try {
        const files = fs.readdirSync(pathResolve(item.filePath))
        const data = this.sortResources(
          files.map((f) => ({ filePath: path.join(item.filePath, f), group: '' })),
          sort === 'MANUAL' ? 'ASC' : sort
        )
        
        const childResources = this.data2Resource(data, 'resourceChild')
        this.itemMap.set(element?.value, {value: element, resource: childResources})
        return childResources;
      } catch (error) {
        console.log(error)
        this.itemMap.set(element?.value, {value: element, resource: []})
        return []
      }
    }
    this.itemMap.set(element?.value, {value: element, resource: []})
    return []
  }

  private getSortedFavouriteResources(): Array<ItemInSettingsJson> {
    const resources = getCurrentResources()
    const sort = configMgr.get('sortOrder') as string

    if (sort === 'MANUAL') {
      return resources
    }

    const data = this.sortResources(
      resources.map((item) => item),
      sort
    )
    return data.map((r) => ({ filePath: r.filePath, group: r.group }))
  }

  private sortResources(resources: Array<ItemInSettingsJson>, sort: string): Array<Item> {
    const resourcesStats = resources.map((r) => this.getResourceStat(r))
    const isAsc = sort === 'ASC'
    resourcesStats.sort(function (a, b) {
      const aName = path.basename(a.filePath)
      const bName = path.basename(b.filePath)
      const aStat = a.stat
      const bStat = b.stat

      if (aStat === FileStat.DIRECTORY && bStat === FileStat.FILE) {
        return -1
      }
      if (aStat === FileStat.FILE && bStat === FileStat.DIRECTORY) {
        return 1
      }

      if (aName < bName) {
        return isAsc ? -1 : 1
      }
      return aName === bName ? 0 : isAsc ? 1 : -1
    })
    return resourcesStats
  }

  private getResourceStat(item: ItemInSettingsJson): Item {
    try {
      const stats = fs.statSync(pathResolve(item.filePath))
      if (stats.isFile()) {
        return {
          filePath: item.filePath,
          stat: FileStat.FILE,
          group: item.group,
        }
      }
      if (stats.isDirectory()) {
        return {
          filePath: item.filePath,
          stat: FileStat.DIRECTORY,
          group: item.group,
        }
      }
    } catch (error) {
      console.log(error)
      return {
        filePath: item.filePath,
        stat: FileStat.NEITHER,
        group: item.group,
      }
    }
  }

  private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
    return data.map((i) => {
      const uri = vscode.Uri.file(pathResolve(i.filePath));
      // let uri = vscode.Uri.parse(`file://${pathResolve(i.filePath)}`)
      // if (os.platform().startsWith('win')) {
      //   uri = vscode.Uri.parse(`file:///${pathResolve(i.filePath)}`.replace(/\\/g, '/'))
      // }
      if (i.stat === FileStat.DIRECTORY) {
        return new Resource(
          path.basename(i.filePath),
          vscode.TreeItemCollapsibleState.Collapsed,
          i.filePath,
          contextValue + '.dir',
          undefined,
          uri
        )
      }

      return new Resource(
        path.basename(i.filePath),
        vscode.TreeItemCollapsibleState.None,
        i.filePath,
        contextValue,
        {
          command: 'favourite.open',
          title: '',
          arguments: [uri],
        },
        uri
      )
    })
  }
}

export class Resource extends vscode.TreeItem {
  public resourceUri: vscode.Uri

  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public value: string,
    public contextValue: string,
    public command?: vscode.Command,
    public uri?: vscode.Uri
  ) {
    super(label, collapsibleState)

    this.resourceUri = uri ? uri : vscode.Uri.file(value)
    this.tooltip = value
  }
}