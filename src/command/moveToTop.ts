import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToTop(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.moveToTop', async function (value: Resource) {
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

    if (currentIndex === filteredArray[0].previousIndex) {
      return
    }

    items.unshift(items[currentIndex])
    items.splice(currentIndex + 1, 1)

    configMgr.save([{key: 'resources', value: items}, {key: 'sortOrder', value: 'MANUAL'}]).catch(console.warn)
  })
}
