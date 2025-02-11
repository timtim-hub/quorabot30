import { Stagehand } from "@browserbasehq/stagehand";
import config from "./stagehand.config";
import { z } from "zod";

class QuoraBot {
  private stagehand: Stagehand;
  private isLoggedIn: boolean = false;

  constructor() {
    this.stagehand = new Stagehand(config);
  }

  async initialize() {
    console.log('Initializing browser...');
    await this.stagehand.init();
    await this.stagehand.page.goto('https://www.quora.com');
  }

  async acceptCookies() {
    console.log('Attempting to accept cookies...');
    try {
      const cookieResults = await this.stagehand.page.observe({
        instruction: "find the accept cookies button or a button that accepts terms",
        onlyVisible: false,
        returnAction: true
      });
      
      if (cookieResults.length > 0) {
        await this.stagehand.page.act(cookieResults[0]);
        console.log('Cookies accepted');
      }
    } catch (error) {
      console.log('No cookie banner found or already accepted');
    }
  }

  async login() {
    if (this.isLoggedIn) return;
    console.log('Attempting to log in...');
    
    // Accept cookies first
    await this.acceptCookies();
    
    // Find and fill email field
    const emailFieldResults = await this.stagehand.page.observe({
      instruction: "Identify and click the email input field that has 'Deine E-Mail Adresse' as its placeholder, ensuring it belongs to the login form (and not a registration form). Then fill it with the provided email.",
      onlyVisible: false,
      returnAction: true
    });
    await this.stagehand.page.act({
      ...emailFieldResults[0],
      arguments: ["shemikaianniellow7011@hotmail.com"]
    });

    // Find and fill password field
    const passwordFieldResults = await this.stagehand.page.observe({
      instruction: "Identify and click the password input field that has 'Dein Passwort' as its placeholder, ensuring it belongs to the login form. Then fill it with the provided password.",
      onlyVisible: false,
      returnAction: true
    });
    await this.stagehand.page.act({
      ...passwordFieldResults[0],
      arguments: ["cJ45g5Z3bKSt"]
    });

    // Find and click submit button
    const submitButtonResults = await this.stagehand.page.observe({
      instruction: "find the login or submit button",
      onlyVisible: false,
      returnAction: true
    });
    await this.stagehand.page.act(submitButtonResults[0]);

    // Wait for navigation to complete
    await this.stagehand.page.waitForLoadState('networkidle');

    // Verify login success
    const { isLoggedIn } = await this.stagehand.page.extract({
      instruction: "check if we are logged in by looking for user profile elements",
      schema: z.object({
        isLoggedIn: z.boolean()
      }),
      useTextExtract: false
    });

    if (!isLoggedIn) {
      throw new Error('Failed to log in to Quora');
    }

    this.isLoggedIn = true;
    console.log('Successfully logged in to Quora!');
  }

  async findAndAnswerQuestions(maxQuestions: number = 5) {
    console.log('Looking for questions to answer...');

    // Go to Answer page
    await this.stagehand.page.goto('https://www.quora.com/answer');
    await this.stagehand.page.waitForLoadState('networkidle');

    // Extract questions
    const { questions } = await this.stagehand.page.extract({
      instruction: "extract all unanswered questions with their links",
      schema: z.object({
        questions: z.array(z.object({
          title: z.string(),
          link: z.string(),
          topics: z.array(z.string()).optional()
        }))
      }),
      useTextExtract: true
    });

    console.log(`Found ${questions.length} questions to answer`);

    // Process each question
    for (const question of questions.slice(0, maxQuestions)) {
      console.log(`\nProcessing question: ${question.title}`);
      
      // Navigate to question
      await this.stagehand.page.goto(question.link);
      await this.stagehand.page.waitForLoadState('networkidle');

      // Find and click answer button
      const answerButtonResults = await this.stagehand.page.observe({
        instruction: "find the button or link to write an answer",
        onlyVisible: false,
        returnAction: true
      });
      await this.stagehand.page.act(answerButtonResults[0]);

      // Extract question context and existing answers
      const { context, existingAnswers } = await this.stagehand.page.extract({
        instruction: "extract the question details, context, and any existing answers",
        schema: z.object({
          context: z.string(),
          existingAnswers: z.array(z.string()).optional()
        }),
        useTextExtract: true
      });

      // Generate a unique answer based on context and existing answers
      const answer = this.generateAnswer(question.title, context, existingAnswers);
      
      // Find and fill answer field
      const answerFieldResults = await this.stagehand.page.observe({
        instruction: "find the answer text editor or input field",
        onlyVisible: false,
        returnAction: true
      });
      await this.stagehand.page.act({
        ...answerFieldResults[0],
        arguments: [answer]
      });

      // Submit answer
      const submitResults = await this.stagehand.page.observe({
        instruction: "find the submit or post answer button",
        onlyVisible: false,
        returnAction: true
      });
      await this.stagehand.page.act(submitResults[0]);

      // Wait for submission
      await this.stagehand.page.waitForLoadState('networkidle');
      console.log('Answer submitted successfully');

      // Add a delay between questions
      await this.delay(5000);
    }
  }

  async upvoteAnswers(maxUpvotes: number = 5) {
    console.log('Looking for answers to upvote...');

    // Go to home feed
    await this.stagehand.page.goto('https://www.quora.com');
    await this.stagehand.page.waitForLoadState('networkidle');

    // Find upvote buttons
    const upvoteResults = await this.stagehand.page.observe({
      instruction: "find all upvote buttons on high-quality answers",
      onlyVisible: false,
      returnAction: true
    });

    // Upvote some answers
    for (const upvoteButton of upvoteResults.slice(0, maxUpvotes)) {
      await this.stagehand.page.act(upvoteButton);
      await this.delay(2000);
    }

    console.log('Finished upvoting answers');
  }

  async followTopics(maxTopics: number = 3) {
    console.log('Looking for interesting topics to follow...');

    // Go to topics page
    await this.stagehand.page.goto('https://www.quora.com/topics');
    await this.stagehand.page.waitForLoadState('networkidle');

    // Find and extract recommended topics
    const { topics } = await this.stagehand.page.extract({
      instruction: "extract recommended topics with their follow buttons",
      schema: z.object({
        topics: z.array(z.object({
          name: z.string(),
          description: z.string().optional()
        }))
      }),
      useTextExtract: true
    });

    // Follow selected topics
    for (const topic of topics.slice(0, maxTopics)) {
      console.log(`Following topic: ${topic.name}`);
      const followButton = await this.stagehand.page.observe({
        instruction: `find the follow button for the topic "${topic.name}"`,
        onlyVisible: false,
        returnAction: true
      });
      await this.stagehand.page.act(followButton[0]);
      await this.delay(2000);
    }
  }

  private generateAnswer(question: string, context: string, existingAnswers: string[] = []): string {
    // Here you would implement your answer generation logic
    // For now, we'll return a placeholder
    return `Based on the question "${question}" and context "${context}", here's my thoughtful answer...`;
  }

  private async delay(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();
      await this.login();

      while (true) {
        try {
          // Follow some topics occasionally
          if (Math.random() < 0.2) { // 20% chance
            await this.followTopics(3);
          }

          // Answer questions
          await this.findAndAnswerQuestions(5);

          // Upvote answers
          await this.upvoteAnswers(5);

          // Wait before next iteration
          console.log('\nWaiting 5 minutes before next round...');
          await this.delay(5 * 60 * 1000);

        } catch (error) {
          console.error('Error in bot loop:', error);
          console.log('Continuing with next iteration...');
          await this.delay(30000); // Wait 30 seconds before retrying
        }
      }

    } catch (error) {
      console.error('Fatal error occurred:', error);
      await this.stagehand.close();
      process.exit(1);
    }
  }
}

// Create and run the bot
const bot = new QuoraBot();
bot.run().catch(console.error); 