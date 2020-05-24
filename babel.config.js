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
];

module.exports = { presets, plugins };
