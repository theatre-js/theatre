import {test, expect} from '@playwright/test'

test.describe('r3f-dynamic-tree', () => {
  test('works', async ({page}) => {
    test.setTimeout(30000)
    await page.goto('./tests/r3f-dynamic-tree/')

    const toolbar = page.locator(
      '[data-testid="theatre-extensionToolbar-global"]',
    )

    const snapshotButton = toolbar.getByRole('button').nth(0)
    await snapshotButton.click()

    const pane = page.getByTestId('theatre-pane-content-snapshot #1')
    await expect(pane).toHaveScreenshot({})

    const forwardButton = toolbar.getByRole('button', {name: '>'})
    await forwardButton.click()
    await forwardButton.click()
    await forwardButton.click()
    await expect(pane).toHaveScreenshot({})
  })
})
