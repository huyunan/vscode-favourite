# favorite

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension that lets the developer mark resources (files or folders) as favourite, so they can be easily accessed.

![](https://i-blog.csdnimg.cn/direct/00028da8f17645a8bdc78fba7f61aeb7.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press Enter.

```
ext install yunan-hu.vscode-favourite
```

## Usage

An **Add to Favorite** command in Explorer's context menu saves links to your favourite files or folders into the `.vsfavorite` file of your root folder.

Your favourite are listed in a separate view and can be quickly accessed from there.

### Configuration

```javascript
{
    "resources": [], // resources path you prefer to mark
    "bookmarks": [], // bookmarks you prefer to mark
    "sortOrder": "ASC", // DESC, MANUAL
    "groups": ["Default"], // the groups you have created
    "currentGroup": "Default" // determine the current using group
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
[license-url]: https://img.shields.io/github/license/leftstick/favourite
