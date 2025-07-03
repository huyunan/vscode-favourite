import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { getFirstGitRepository, getGitBranchName } from '../helper/util'

export function addNewGroup(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.group.newGroup', async function (value: Resource) {
    const isGitUsed = !!getFirstGitRepository()

    let branchName: string = 'no_git_master'
    if (isGitUsed) {
      branchName = getGitBranchName()
    }

    const previousGroups = Array.from(
      new Set(((configMgr.get('groups') as string[]) || []).concat([DEFAULT_GROUP]))
    )

    vscode.window
      .showQuickPick(
        ['Input new group name'].concat(!isGitUsed ? [] : ['Create group with current branch name', 'Delete current group'])
      )
      .then((label) => {
        if (label == 'Input new group name') {
          vscode.window.showInputBox({ title: 'Input a name for new group' }).then((input) => {
            if (input) {
              addNewGroupInConfig(input, previousGroups)
            }
          })
        } else if (label == 'Create group with current branch name') {
          addNewGroupInConfig(branchName, previousGroups)
        } else if (label == 'Delete current group') {
          deleteCurrentGroup(previousGroups);
        }
      })
  })
}

function deleteCurrentGroup(previousGroups) {
  const currentGroup = configMgr.get('currentGroup')
  const index = previousGroups.indexOf(currentGroup)
  if (currentGroup === 'Default') {
    vscode.window.showErrorMessage(`The default Group cannot be deleted.`);
  } else if (index !== -1) {
    previousGroups.splice(index, 1)
    configMgr.save('groups', previousGroups);
    configMgr.save('currentGroup', "Default");
  } else {
    vscode.window.showErrorMessage(`The group "${currentGroup}" does not exist.`);
  }
}

function addNewGroupInConfig(name: string, previousGroups: Array<string>) {
  if (previousGroups.indexOf(name) === -1) {
    configMgr.save('groups', previousGroups.concat([name]))
    configMgr.save('currentGroup', name)
  } else {
    vscode.window.showErrorMessage(`The group "${name}" already exists.`)
  }
}
