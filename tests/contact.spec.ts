import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(
    "https://api.emailjs.com/api/v1.0/email/send",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, message: "Mocked EmailJS response" }),
      });
    },
  );
  await page.route(
    "https://www.google.com/recaptcha/api/siteverify",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "Mocked recaptcha response",
        }),
      });
    },
  );
  await page.route("*/**/_actions/emailAction.sendEmail/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, message: "Mocked EmailJS action" }),
    });
  });
  await page.route(
    "*/**/_actions/recaptchaAction.verifyCaptcha/",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, message: "Mocked recaptcha action" }),
      });
    },
  );
  await page.goto("/contact/");
  // Hidde astro-dev-toolbar
  await page.addStyleTag({
    content: "astro-dev-toolbar { display: none !important; }",
  });
  // Hide recaptcha
  await page.addStyleTag({
    content: ".grecaptcha-badge { display: none !important; }",
  });
});

test.describe("Contact Page", () => {
  test("Validate elements in the contact section", async ({ page }) => {
    await expect(page).toHaveURL("http://localhost:4321/contact/");
    await expect(
      page.getByRole("heading", { level: 1, name: "contact" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "I am open to freelance opportunities and collaborations. Whether you have a specific project in mind, need assistance with your ideas, or simply have questions, don’t hesitate to get in touch. I look forward to connecting with you and exploring how I can contribute to your goals.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Subject")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("Should send the contact form", async ({ page }) => {
    await page.getByLabel("Email Address").fill("test@hotmail.com");
    await page.getByLabel("Subject").fill("TestSubject");
    await page.getByLabel("Message").fill("TestMessage");
    await page.getByRole("button", { name: "Send" }).click();
    await page.waitForTimeout(500);
    await expect(
      page.getByRole("button", { name: "Please wait..." }),
    ).toBeVisible();
  });

  test("Visual comparisons", async ({ page, browserName, viewport }) => {
    await page.addStyleTag({
      content:
        "body { animation: none !important; transition: none !important; }",
    });

    const deviceName = `${browserName}-${viewport?.width}x${viewport?.height}`;
    const screenshotName = `contact-${deviceName}.png`;

    await expect(page).toHaveScreenshot(screenshotName, {
      maxDiffPixelRatio: 0.3,
    });
  });

  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
