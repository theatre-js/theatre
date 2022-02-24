import {test, expect} from '@playwright/test'

test.describe('feature foo', () => {
  test.beforeEach(async ({page}) => {
    // Go to the starting url before each test.
    await page.goto('https://playwright.dev/')
  })

  test('my test', async ({page}) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://playwright.dev/')
  })
})
