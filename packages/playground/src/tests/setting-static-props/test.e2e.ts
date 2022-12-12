import {test, expect} from '@playwright/test'
// import percySnapshot from '@percy/playwright'

const isMac = process.platform === 'darwin'

const delay = (dur: number) =>
  new Promise((resolve) => setTimeout(resolve, dur))

test.describe('setting-static-props', () => {
  test.beforeEach(async ({page}) => {
    // TODO This is a temporary hack that re-tries navigating to the url in case the server isn't ready yet.
    // Ideally we should wait running the e2e tests until the server has signalled that it's ready to serve.
    // For now, let's use this hack, otherwise, the e2e test may _randomly_ break on the CI with "ERRConnectionRefused"
    const maxRetries = 3
    for (let i = 1; i <= maxRetries; i++) {
      try {
        await page.goto('http://localhost:8080/tests/setting-static-props')
      } catch (error) {
        if (i === maxRetries) {
          throw error
        } else {
          await delay(1000)
        }
      }
    }
  })

  test('Undo/redo', async ({page}) => {
    // https://github.com/microsoft/playwright/issues/12298
    // The div does in fact intercept pointer events, but it is meant to 🤦‍
    await page
      .locator('span:has-text("sample object")')
      .first()
      .click({force: true})

    const detailPanel = page.locator('[data-testid="DetailPanel-Object"]')

    const firstInput = detailPanel.locator('input[type="text"]').first()
    // Click input[type="text"] >> nth=0
    await firstInput.click()
    // Fill input[type="text"] >> nth=0
    await firstInput.fill('1')
    // Press Enter
    await firstInput.press('Enter')
    const secondInput = detailPanel.locator('input[type="text"]').nth(1)
    // Click input[type="text"] >> nth=1
    await secondInput.click()
    // Fill input[type="text"] >> nth=1
    await secondInput.fill('2')
    // Press Enter
    await secondInput.press('Enter')

    const metaKey = isMac ? 'Meta' : 'Control'

    // Press z with modifiers
    await page.locator('body').press(`${metaKey}+z`)
    await expect(firstInput).toHaveAttribute('value', '1')
    await expect(secondInput).toHaveAttribute('value', '0')
    await page.locator('body').press(`${metaKey}+Shift+z`)
    await expect(firstInput).toHaveAttribute('value', '1')
    await expect(secondInput).toHaveAttribute('value', '2')

    // Our first visual regression test
    // await percySnapshot(page, test.info().titlePath.join('/') + '/After redo')
  })
})
