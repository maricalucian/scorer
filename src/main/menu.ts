import {
  app,
  dialog,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Game',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'Command+N',
          click: () => {
            const res = dialog.showMessageBoxSync({
              message: 'Start a new 501 game?',
              type: 'question',
              buttons: ['Cancel', 'Yes'],
              defaultId: 1,
            });

            if (res === 1) {
              this.mainWindow.webContents.reload();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    // const subMenuHelp: MenuItemConstructorOptions = {
    //   label: 'Help',
    //   submenu: [
    //     {
    //       label: 'Learn More',
    //       click() {
    //         shell.openExternal('https://electronjs.org');
    //       },
    //     },
    //   ],
    // };

    return [subMenuAbout];
    // return [subMenuAbout, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: 'File',
        submenu: [
          {
            label: '&New Game',
            accelerator: 'Ctrl+N',
            click: () => {
              const res = dialog.showMessageBoxSync({
                message: 'Start a new 501 game?',
                type: 'question',
                buttons: ['Cancel', 'Yes'],
                defaultId: 1,
              });

              if (res === 1) {
                this.mainWindow.webContents.reload();
              }
            },
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      // {
      //   label: 'Help',
      //   submenu: [
      //     {
      //       label: 'Learn More',
      //       click() {
      //         shell.openExternal('https://electronjs.org');
      //       },
      //     },
      //   ],
      // },
    ];

    return templateDefault;
  }
}
