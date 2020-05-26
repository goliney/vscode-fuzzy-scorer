const presets = [
  '@babel/preset-typescript',
  [
    '@babel/env',
    {
      targets: {
        node: '6',
      },
      useBuiltIns: 'usage',
      corejs: 3,
    },
  ],
];

const plugins = [
  [
    '@babel/plugin-transform-typescript',
    {
      allowNamespaces: true,
    },
  ],
  '@babel/plugin-proposal-class-properties',
];

module.exports = { presets, plugins };
