import { Stagehand } from "../lib";
import StagehandConfig from "../stagehand.config";

async function main() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    modelName: "o3-mini",
  });

  await stagehand.init();

  // Navigate to Quora login page
  await stagehand.page.goto("https://www.quora.com");

  // Use Stagehand's act API to handle login
  await stagehand.page.act('click on the "Login" button');
  await stagehand.page.act(
    'enter "shemikaianniellow7011@hotmail.com" into the email field',
  );
  await stagehand.page.act('enter "cJ45g5Z3bKSt" into the password field');
  await stagehand.page.act("click on the login or submit button");

  // Wait for navigation to complete
  await stagehand.page.waitForLoadState("networkidle");

  // Verify login success
  const isLoggedIn = await stagehand.page.act(
    "check if we are logged in successfully",
  );
  console.log("Login status:", isLoggedIn);

  // Keep the browser open for inspection
  await new Promise(() => {}); // This will keep the script running
}

main().catch(console.error);
