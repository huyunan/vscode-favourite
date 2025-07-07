# vscode-favorite

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension that lets the developer mark resources (files or folders) as favourite, so they can be easily accessed.

![](https://i-blog.csdnimg.cn/direct/00028da8f17645a8bdc78fba7f61aeb7.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press Enter.

```
ext install yunan-hu.vscode-favorite
```

## Usage

An **Add to Favourite** command in Explorer's context menu saves links to your favourite files or folders into the `.vsfavorite` file of your root folder.

Your favourite are listed in a separate view and can be quickly accessed from there.

### Configuration

```javascript
{
    "favourite.resources": [], // resources path you prefer to mark
    "favourite.sortOrder": "ASC", // DESC, MANUAL
    "favourite.groups": ["Default"], // the groups you have created
    "favourite.currentGroup": "Default" // determine the current using group
}
```

> You normally don't need to modify this config manually. Use context menus instead.

## Changelog

[Changelog on Marketplace](https://marketplace.visualstudio.com/items/yunan-hu.vscode-favorite/changelog)

## LICENSE

[GPL v3 License](https://github.com/huyunan/vscode-favourite/blob/main/LICENSE)

[vs-url]: https://marketplace.visualstudio.com/items?itemName=yunan-hu.vscode-favorite
[vs-image]: https://img.shields.io/visual-studio-marketplace/v/yunan-hu.vscode-favorite
[install-url]: https://img.shields.io/visual-studio-marketplace/i/yunan-hu.vscode-favorite
[rate-url]: https://img.shields.io/visual-studio-marketplace/r/yunan-hu.vscode-favorite
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorite
