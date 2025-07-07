# vscode-favourite

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension that lets the developer mark resources (files or folders) as favourite, so they can be easily accessed.

![](./img/preview.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press Enter.

```
ext install yunan-hu.vscode-favourite
```

## Usage

An **Add to Favourite** command in Explorer's context menu saves links to your favourite files or folders into your _*`XYZ`*_`.code-workspace` file if you are using one, else into the `./.vsfavourite` file of your root folder.

Your favourite are listed in a separate view and can be quickly accessed from there.

### Configuration

```javascript
{
    "favourite.resources": [], // resources path you prefer to mark
    "favourite.sortOrder": "ASC", // DESC, MANUAL
    "favourite.refreshTime": "" // whether to use an extra config file
    "favourite.groups": ["Default"], // the groups you have created
    "favourite.currentGroup": "Default" // determine the current using group
}
```

> You normally don't need to modify this config manually. Use context menus instead.

## Changelog

[Changelog on Marketplace](https://marketplace.visualstudio.com/items/yunan-hu.vscode-favourite/changelog)

## LICENSE

[GPL v3 License](https://github.com/huyunan/vscode-favourite/blob/main/LICENSE)

[vs-url]: https://marketplace.visualstudio.com/items?itemName=yunan-hu.vscode-favourite
[vs-image]: https://img.shields.io/visual-studio-marketplace/v/yunan-hu.vscode-favourite
[install-url]: https://img.shields.io/visual-studio-marketplace/i/yunan-hu.vscode-favourite
[rate-url]: https://img.shields.io/visual-studio-marketplace/r/yunan-hu.vscode-favourite
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favourite
