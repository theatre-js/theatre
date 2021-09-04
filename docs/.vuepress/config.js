const path = require('path')

const pathToMonorepo = path.join(__dirname, '../..')

module.exports = {
  title: 'Theatre.js',
  description: 'Motion graphics for the web',
  head: [['link', {rel: 'icon', href: '/public/theatrejs-logo-2x.png'}]],
  themeConfig: {
    logo: '/public/theatrejs-logo-black.svg',
    nav: [
      {
        text: 'Guide',
        link: '/',
      },
      {
        text: 'API',
        link: '/api',
      },
      {
        text: 'Older versions',
        items: [
          {
            text: '0.4 (Current)',
            link: 'https://docs.theatrejs.com',
          },
          {
            text: '0.3',
            link: 'https://github.com/ariaminaei/theatre/tree/0.3',
          },
          {
            text: '0.2',
            link: 'https://v02.docs.theatrejs.com/',
          },
          {
            text: '0.1',
            link: 'https://github.com/ariaminaei/theatre/tree/0.1',
          },
        ],
      },
      {
        text: 'Get in touch',
        items: [
          {
            text: 'Discord community',
            link: 'https://discord.gg/bm9f8F9Y9N',
          },
          {
            text: 'Twitter',
            link: 'https://twitter.com/theatre_js',
          },
          {
            text: 'Email',
            link: 'mailto:hello@theatrejs.com',
          },
        ],
      },
    ],
    sidebar: [
      {
        title: 'Guide',
        children: ['/getting-started'],
      },
      {
        title: 'API',
        path: '/api',
        // sidebarDepth: 2,
        children: ['/api/core/', '/api/studio/'],
      },
      {
        title: 'Support',
        children: ['/support', '/faq'],
      },
    ],
    lastUpdated: 'Last Updated',

    repo: 'ariaminaei/theatre',
    docsRepo: 'ariaminaei/theatre-docs',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on Github',
  },
  plugins: [
    //   ...['core', 'studio'].map((which) => [
    //     'vuepress-plugin-typedoc',
    //     {
    //       entryPoints: [
    //         path.join(pathToMonorepo, `./theatre/${which}/src/index.ts`),
    //       ],
    //       tsconfig: path.join(pathToMonorepo, `./theatre/tsconfig.json`),
    //       out: `api/${which}`,
    //       sidebar: null,
    //       readme: `none`,
    //       // hideInPageTOC: true,
    //       // categorizeByGroup: false,
    //     },
    //   ]),
  ],
}
