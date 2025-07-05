import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import localize from '../helper/localize'
import { getFirstGitRepository, getGitBranchName } from '../helper/util'
import { ItemInSettingsJson } from '../model'

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
        [localize('ext.new.group.name')].concat(!isGitUsed ? [] : [localize('ext.new.group.current.name'), localize('ext.delete.current.group')])
      )
      .then((label) => {
        if (label == localize('ext.new.group.name')) {
          vscode.window.showInputBox({ title: localize('title.new.group.name') }).then((input) => {
            if (input) {
              addNewGroupInConfig(input, previousGroups)
            }
          })
        } else if (label == localize('ext.new.group.current.name')) {
          addNewGroupInConfig(branchName, previousGroups)
        } else if (label == localize('ext.delete.current.group')) {
          deleteCurrentGroup(previousGroups);
        }
      })
  })
}

function deleteCurrentGroup(previousGroups) {
  const currentGroup = configMgr.get('currentGroup')
  const resources = (configMgr.get('resources') as Array<ItemInSettingsJson>) || []
  const index = previousGroups.indexOf(currentGroup)
  if (currentGroup === localize('ext.default')) {
    vscode.window.showErrorMessage(localize('msg.delete.default.group'));
  } else if (index !== -1) {
    previousGroups.splice(index, 1)
    const newResources: Array<ItemInSettingsJson> = resources.filter(item => item.group != currentGroup)
    let newCurrentGroup = previousGroups[index - 1]
    if (previousGroups.length > index) {
      newCurrentGroup = previousGroups[index]
    }
    const saveItems = [
      {key: 'groups', value: previousGroups},
      {key: 'currentGroup', value: newCurrentGroup},
      {key: 'resources', value: newResources}
    ]
    configMgr.save(saveItems);
  } else {
    vscode.window.showErrorMessage(`${localize('msg.group.not.exist.left')} "${currentGroup}" ${localize('msg.group.not.exist.right')}`);
  }
}

function addNewGroupInConfig(name: string, previousGroups: Array<string>) {
  if (previousGroups.indexOf(name) === -1) {
    configMgr.save([{key: 'groups', value: previousGroups.concat([name])}, {key: 'currentGroup', value: name}]);
  } else {
    vscode.window.showErrorMessage(`${localize('msg.group.exist.left')} "${name}" ${localize('msg.group.exist.right')}`)
  }
}
