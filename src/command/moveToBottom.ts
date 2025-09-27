import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import { getAllBookmarks, getCurrentResources } from '../helper/util'

export function moveToBottom(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.moveToBottom', async function (value: Resource) {
    if (configMgr.marktree.visible) {
      const allBookmarks = getAllBookmarks()
      const index = allBookmarks.findIndex(b => b.filePath === value.value)
      if (index === allBookmarks.length - 1) return
      const tmp = allBookmarks[index]
      allBookmarks.splice(index, 1)
      allBookmarks.push(tmp)
      await configMgr.save([{key: 'bookmarks', value: allBookmarks}]).catch(console.warn)
      return
    }
    const currentGroup = configMgr.get('currentGroup') as string

    const items = await getCurrentResources()
    const filteredArray: {
      filePath: string
      group: string
      previousIndex: number
    }[] = []

    items.forEach((value, index) => {
      if (value.group == currentGroup) {
        filteredArray.push({ filePath: value.filePath, group: value.group, previousIndex: index })
      }
    })

    const currentIndex = filteredArray.find((i) => i.filePath === value.value).previousIndex

    if (currentIndex === filteredArray[filteredArray.length - 1].previousIndex) {
      return
    }

    items.push(items[currentIndex])
    items.splice(currentIndex, 1)

    configMgr.save([{key: 'resources', value: items}, {key: 'sortOrder', value: 'MANUAL'}]).catch(console.warn)
  })
}
