const { autoUpdater } = require('electron-updater');
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

module.exports = () => {
  autoUpdater.checkForUpdatesAndNotify();
}