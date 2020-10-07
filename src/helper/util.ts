import * as vscode from 'vscode'
import * as path from 'path'

export function getSingleRootPath(): string {
  return vscode.workspace.workspaceFolders[0].uri.fsPath
}

export function isMultiRoots(): boolean {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1
}

export function hasRoot(): boolean {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
}

export function pathResolve(filePath: string) {
  if (isMultiRoots() || !hasRoot()) {
    return filePath
  }
  return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath)
}
