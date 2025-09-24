import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveDown(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.moveDown', async function (value: Resource) {
    if (configMgr.marktree.visible) {
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
    const targetIndexOfFiltered = filteredArray.findIndex((i) => i.filePath === value.value)

    if (currentIndex === filteredArray[filteredArray.length-1].previousIndex) {
      return
    }else{
      var nextIndex = filteredArray[targetIndexOfFiltered+1].previousIndex
    }

    let resources = replaceArrayElements(items, currentIndex, nextIndex)

    configMgr.save([{key: 'resources', value: resources}, {key: 'sortOrder', value: 'MANUAL'}]).catch(console.warn)
  })
}
