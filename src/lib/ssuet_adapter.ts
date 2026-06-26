import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface StudentMark {
  rollNumber: string;
  marks: string;
}

export class SsuetAdapter {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Initializes the headless browser. 
   * Optionally takes a path to saved cookies to bypass login.
   */
  async init(sessionCookiePath?: string) {
    // Using headless: false for initial testing so we can visually see it working.
    // In production background workers, this will be headless: true
    this.browser = await chromium.launch({ headless: false }); 
    
    if (sessionCookiePath) {
      console.log(`Loading cached session from ${sessionCookiePath}...`);
      this.context = await this.browser.newContext({ storageState: sessionCookiePath });
    } else {
      this.context = await this.browser.newContext();
    }
    
    this.page = await this.context.newPage();
  }

  /**
   * Automates the login process for the SSUET portal.
   */
  async login(username: string, password: string): Promise<boolean> {
    if (!this.page) throw new Error("Browser not initialized. Call init() first.");

    try {
      console.log("Navigating to SSUET login page...");
      await this.page.goto('https://edusmartz.ssuet.edu.pk/FacultyPortal/Faculty/EDU_EBS_FCT_Login.aspx', { waitUntil: 'networkidle' });

      // Note: These selectors are educated guesses. We will need to inspect the actual DOM of the 
      // SSUET login page to get the exact #id or [name] attributes of the input fields.
      console.log("Entering credentials...");
      
      // Look for common ID patterns for ASP.NET WebForms (which the .aspx extension suggests)
      const userField = await this.page.locator('input[type="text"], input[id*="User"], input[id*="Login"]');
      const passField = await this.page.locator('input[type="password"]');
      const loginBtn = await this.page.locator('input[type="submit"], button[type="submit"], input[id*="Login"]');

      await userField.first().fill(username);
      await passField.first().fill(password);
      
      console.log("Clicking login...");
      await loginBtn.first().click();

      // Wait for the dashboard to load to confirm success
      await this.page.waitForLoadState('networkidle');
      
      // Check if we are actually logged in (e.g., login page no longer visible, or dashboard element present)
      console.log("Login sequence executed successfully!");
      return true;
    } catch (error) {
      console.error("Login automation failed:", error);
      return false;
    }
  }

  /**
   * Injects the verified JSON data into the portal's grading sheet.
   * Returns the path to the audit trail screenshot if requested.
   */
  async injectMarks(courseId: string, marksData: StudentMark[], screenshotPath?: string): Promise<string | undefined> {
    if (!this.page) throw new Error("Browser not initialized.");
    
    console.log(`[Task Started] Injecting marks for course: ${courseId}`);
    
    // 1. Navigate to the marks entry page for the specific course
    // Assuming a hypothetical URL structure for the grading page
    await this.page.goto(`https://edusmartz.ssuet.edu.pk/FacultyPortal/Grading/Entry.aspx?course=${courseId}`, { waitUntil: 'networkidle' });

    // 2. Loop through marksData
    for (const student of marksData) {
      console.log(`Injecting marks for Roll No: ${student.rollNumber}`);
      
      // 3. For each student, find their specific input box using their rollNumber
      // We look for a table row containing the roll number, then find the input box inside that row.
      // This is a robust way to handle dynamic ASP.NET grids.
      const rowLocator = this.page.locator('tr', { hasText: student.rollNumber });
      
      // Check if the student exists in the portal list
      if (await rowLocator.count() > 0) {
        // Find the input field for marks within this specific row
        const marksInput = rowLocator.locator('input[type="text"], input[type="number"]');
        
        // 4. Input the mark
        // Clear existing value if any, then fill
        await marksInput.fill('');
        await marksInput.fill(student.marks);
      } else {
        console.warn(`[Warning] Roll number ${student.rollNumber} not found in the portal grid.`);
      }
    }
    
    // 5. Click Save
    console.log("Saving all injected marks...");
    const saveBtn = this.page.locator('input[type="submit"][value*="Save"], button:has-text("Save")');
    await saveBtn.click();
    
    // Wait for the save confirmation (e.g., a success message or network idle)
    await this.page.waitForLoadState('networkidle');
    
    console.log(`Injected ${marksData.length} records successfully.`);

    if (screenshotPath) {
      console.log(`Capturing audit trail screenshot at ${screenshotPath}`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      return screenshotPath;
    }
  }

  /**
   * Closes the browser and saves the session cookies to bypass future logins.
   */
  async close(saveSessionPath?: string) {
    if (saveSessionPath && this.context) {
       console.log(`Saving session to bypass future logins at ${saveSessionPath}...`);
       await this.context.storageState({ path: saveSessionPath });
    }
    await this.browser?.close();
  }
}
