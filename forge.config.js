const appBundleId = 'com.cellosoft.graphql98';

function getOsxNotarizeConfig() {
  if (process.platform !== 'darwin' || !process.env.CI) {
    return undefined;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    throw new Error(
      'Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!',
    );
  }

  return {
    appBundleId,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: '72679R6V8X',
  };
}

module.exports = {
  packagerConfig: {
    name: 'GraphQL 98',
    executableName: 'graphql-98',
    asar: process.env.NODE_ENV === 'production' && process.env.ASAR !== 'false',
    icon: 'images/icon',
    appBundleId: appBundleId,
    appCategoryType: 'public.app-category.developer-tools',
    darwinDarkModeSupport: true,
    win32metadata: {
      CompanyName: 'Marcello Bastea-Forte',
      OriginalFilename: 'GraphQL 98',
    },
    osxSign: {
      identity: 'Developer ID Application: Marcello Bastéa-Forte (72679R6V8X)',
      hardenedRuntime: true,
      'gatekeeper-assess': false,
      entitlements: 'config/entitlements.plist',
      'entitlements-inherit': 'config/entitlements.plist',
      'signature-flags': 'library',
    },
    osxNotarize: getOsxNotarizeConfig(),
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'GraphQL98',
        exe: 'graphql-98.exe',
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              preload: {
                js: './src/preload/preload.ts',
              },
              name: 'app',
            },
          ],
        },
      },
    ],
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'marcello3d',
          name: 'graphql-98',
        },
      },
    },
  ],
};
