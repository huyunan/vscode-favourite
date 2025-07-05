import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import localize from '../helper/localize'
import { getFirstGitRepository, getGitBranchName } from '../helper/util'
import { DEFAULT_GROUP } from '../enum'

export function changeGroup(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.group.changeGroup', async function (value: Resource) {
    const isGitUsed = !!getFirstGitRepository()

    let branchName: string = 'no_git_master'
    if (isGitUsed) {
      branchName = getGitBranchName()
    }
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const groups = Array.from(new Set(((configMgr.get('groups') as string[]) || []).concat([DEFAULT_GROUP])))

    let doesCurrentBranchNameGroupExist: boolean
    let isInCurrentBranchGroup: boolean
    if (isGitUsed) {
      doesCurrentBranchNameGroupExist = groups.indexOf(branchName) !== -1
      isInCurrentBranchGroup = currentGroup === branchName
    }
    vscode.window
      .showQuickPick(
        isGitUsed && doesCurrentBranchNameGroupExist && !isInCurrentBranchGroup
          ? [localize('ext.switch.current.group')].concat(
              groups.filter((item) => item !== branchName && item !== currentGroup)
            )
          : groups.filter((item) => item !== branchName && item !== currentGroup),
        { title: localize('title.choose.switch.group') }
      )
      .then((selectedCommand) => {
        if (selectedCommand === localize('ext.switch.current.group')) {
          configMgr.save([{key: 'currentGroup', value: branchName}])
        } else if (selectedCommand != undefined) {
          configMgr.save([{key: 'currentGroup', value: selectedCommand}])
        }
      })
  })
}
