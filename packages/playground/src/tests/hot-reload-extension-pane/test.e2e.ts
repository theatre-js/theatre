import {test, expect} from '@playwright/test'

test.describe('hot-reload-extension-pane', () => {
  test('works', async ({page}) => {
    await page.goto('./tests/hot-reload-extension-pane/')

    const toolbar = page.locator(
      '[data-test-id="theatre-extensionToolbar-global"]',
    )

    const forwardButton = toolbar.getByRole('button', {name: '>'})
    await forwardButton.click()

    const pane = page.locator(
      '[data-test-id="theatre-pane-content-pane1 \\#1"]',
    )

    expect(await pane.textContent()).toEqual('pane1-config1')
    await forwardButton.click()
    expect(await pane.textContent()).toEqual('pane1-config2')
    await forwardButton.click()
    await expect(pane).not.toBeAttached()
    await forwardButton.click()
    expect(await pane.textContent()).toEqual('pane1-config2')
  })
})
