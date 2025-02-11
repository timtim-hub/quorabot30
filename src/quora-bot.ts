import { Stagehand } from '@browserbasehq/stagehand';
import 'dotenv/config';

async function main() {
  // Initialize Stagehand
  const stagehand = new Stagehand({
    modelName: "gpt-4",
    verbose: 1,
    headless: process.env.HEADLESS === 'true'
  });

  try {
    console.log('Initializing browser...');
    await stagehand.init();
    
    // Navigate to Quora login page
    console.log('Navigating to Quora...');
    await stagehand.page.goto('https://www.quora.com');

    // Handle login
    console.log('Attempting to log in...');
    
    try {
      // Try to find and click the login button
      await stagehand.page.act('click on the "Login" button or link');
      
      // Enter credentials
      await stagehand.page.act('enter "shemikaianniellow7011@hotmail.com" into the email or username field');
      await stagehand.page.act('enter "cJ45g5Z3bKSt" into the password field');
      
      // Click login
      await stagehand.page.act('click on the login or submit button');

      // Wait for navigation to complete
      await stagehand.page.waitForLoadState('networkidle');

      // Verify login success
      const isLoggedIn = await stagehand.page.act('check if we are logged in successfully by looking for user profile elements or login-specific content');
      console.log('Login status:', isLoggedIn);

      if (isLoggedIn) {
        console.log('Successfully logged in to Quora!');
      } else {
        console.log('Login might have failed. Please check the browser.');
      }

    } catch (loginError) {
      console.error('Error during login process:', loginError);
      throw loginError;
    }

    // Keep the browser open for inspection
    console.log('Login process completed. Keeping browser open for inspection...');
    await new Promise(() => {}); // This will keep the script running

  } catch (error) {
    console.error('Error occurred:', error);
    await stagehand.close();
    process.exit(1);
  }
}

main().catch(console.error); 