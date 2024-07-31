const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require("node:path")

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'src', 'favicon')
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://mining-monitor.github.io/favicon.ico',
        setupIcon: path.join(__dirname, 'src', 'favicon.ico')
      },
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        iconUrl: 'https://mining-monitor.github.io/favicon.ico',
        setupIcon: path.join(__dirname, 'src', 'favicon.ico'),
        language: 1049,
        manufacturer: 'mining-monitor'
      },
      platforms: ['win32']
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
