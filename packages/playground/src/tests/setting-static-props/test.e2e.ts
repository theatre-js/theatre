import {test, expect} from '@playwright/test'
import percySnapshot from '@percy/playwright'

const isMac = process.platform === 'darwin'

test.describe('setting-static-props', () => {
  test.beforeEach(async ({page}) => {
    // Go to the starting url before each test.
    await page.goto('http://localhost:8080/tests/setting-static-props')
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
    await percySnapshot(page, test.info().titlePath.join('/') + '/After redo')
  })
})
