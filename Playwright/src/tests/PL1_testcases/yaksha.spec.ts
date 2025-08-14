import { chromium, test } from "playwright/test";
import { Page, Locator, expect } from "@playwright/test";
import LoginPage from "src/pages/LoginPage";
import { MyInfoPage } from "src/pages/MyInfoPage";
import { DependentsPage } from "src/pages/DependentPage";
import * as fs from 'fs';
import TestData from "../../Data/testData.json";
import * as path from 'path';
const downloads = path.resolve(__dirname, '../../downloads');
const data = JSON.parse(JSON.stringify(require("../../Data/login.json")));


test.describe("Yaksha", () => {
  let loginPage: LoginPage;
  let myinfoPage: MyInfoPage;
  let dependentsPage: DependentsPage;

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto("https://yakshahrm.makemylabs.in/orangehrm-5.7");
    //await page.goto("https://opensource-demo.orangehrmlive.com");
    loginPage = new LoginPage(page);
    myinfoPage = new MyInfoPage(page);
    dependentsPage = new DependentsPage(page);
    
    await loginPage.performLogin();
  });






  /**
   * Test Case 1: Verify My Info tab Loads
   *
   * Steps:
   * 1. Login with valid credentials
   * 2. Click on the "My Info" tab
   *
   * Expected:
   * The My Info tab should be visible and accessible
   */
  test("TC1 - Verify My Info tab Loads", async () => {
    const URL = await myinfoPage.clickMyInfoTab();
    expect(URL.length).toBeGreaterThan(0);
    const myinfoUrl= "https://yakshahrm.makemylabs.in/orangehrm-5.7/web/index.php/pim/viewPersonalDetails/empNumber"
    expect(URL).toContain(myinfoUrl);
  });






 /**
   * Test Case 2: Verify required field error on blank name
   *
   * Steps:
   * 1. Navigate to "My Info"
   * 2. Clear the name input
   * 3. Check for validation
   *
   * Expected:
   * Required field error should be displayed for empty name
   */
  test("TC2 - Verify required field error on blank name", async () => {
    const nameValue = await myinfoPage.clearAndEnterName();
    expect(nameValue.length).toBeGreaterThan(0);
    expect(nameValue).toBe("Required");
  });





  /**
 * Test Case 3: Verify name gets edited
 *
 * Purpose:
 * Ensures that a user can successfully update their name in the personal details section.
 *
 * Steps:
 * 1. Generate a unique name dynamically.
 * 2. Navigate to the "My Info" tab.
 * 3. Clear the existing name field and enter the new name.
 * 4. Save the changes and reload the page.
 * 5. Retrieve the displayed profile name from the header.
 *
 * Expected:
 * The updated profile name should be visible in the top-right dropdown and match the new name.
 */
  test("TC3 -Verify the name gets edited successfully", async () => {
    const newName = `TestUser_${Math.floor(Math.random() * 1000)}`;
    const updatedName = await myinfoPage.updateUniqueNAmeAndVerifyName(newName);
    expect(updatedName.length).toBeGreaterThan(0);
    expect(updatedName).toContain(newName);
  });

 



 /**
 * Test Case 4: Verify all My Info sub-tabs have unique hrefs
 *
 * Purpose:
 * Ensure that each sub-tab under the "My Info" section has a unique navigation URL,
 * preventing routing conflicts and confirming correct tab linkage.
 *
 * Steps:
 * 1. Navigate to the "My Info" tab.
 * 2. Locate the sub-tabs (e.g., Personal Details, Contact Details, Emergency Contacts).
 * 3. Extract the `href` attributes from each sub-tab element.
 * 4. Assert that the extracted list is not empty.
 * 5. Check that each `href` is unique.
 *
 * Expected:
 * All extracted sub-tab `href`s must be unique and valid.
 */

  test("TC4 - Verify all My Info sub-tabs have unique hrefs", async () => {
    const Urls = await dependentsPage.areMyInfoSubTabHrefsUnique();
    console.log("-----------------------------------------")
   expect(Urls.length).toBeGreaterThan(0);
    const areUnique: boolean = new Set(Urls).size === Urls.length;
    expect(areUnique).toBeTruthy();
  });





 /**
 * Test Case 5: Add a new dependent
 *
 * Purpose:
 * Verify that a user can add a new dependent under the "Dependents" section of the My Info tab.
 *
 * Steps:
 * 1. Generate a unique dependent name using a timestamp.
 * 2. Navigate to the "My Info" > "Dependents" section.
 * 3. Click the "Add" button to initiate the add flow.
 * 4. Enter the dependent name and select the relationship from the dropdown.
 * 5. If "Other" is selected, specify the relationship manually.
 * 6. Click the "Save" button to submit.
 * 7. Assert that the newly added dependent appears in the list.
 *
 * Expected:
 * The newly added dependent name should be visible in the dependents table.
 */

  test("TC5 -Verify new Dependant could be added to the list", async () => {
    const name = `Child_${Date.now()}`;
    await dependentsPage.addDependent(name, TestData.TestData1.defaultDependentRelation);
    const dependentEntry = dependentsPage.page.locator(
      `.orangehrm-container:has-text("${name}")`
    );
    await expect(dependentEntry).toBeVisible();
  });





 /**
 * Test Case 6: Show 'Specify' field only when 'Other' is selected
 *
 * Purpose:
 * Ensure the "Specify" input field becomes visible only when the "Other" option is selected from the relationship dropdown.
 *
 * Steps:
 * 1. Navigate to the "My Info" > "Dependents" section.
 * 2. Click the "Add" button to add a new dependent.
 * 3. Open the relationship dropdown and select the "Other" option.
 * 4. Check whether the "Specify" input field is displayed.
 *
 * Expected:
 * The "Specify" field should be visible only after selecting the "Other" option.
 */

  test("TC6 - Show 'Specify' field only when 'Other' is selected", async () => {
    const isSpecifyVisible = await dependentsPage.selectOtherAndCheckSpecifyField();
    expect(isSpecifyVisible).toBeTruthy();
  });


 /**
 * Test Case: TS-7 Verify adding a membership from the list
 *
 * Objective:
 * Confirm that a new membership can be added in My Info > Membership tab
 * and that the entered amount appears in the list.
 *
 * Steps:
 * 1. Generate a unique amount.
 * 2. Add membership with the amount.
 * 3. Verify the list contains the new amount.
 */
test("TS-7 Verify that a membership can be added from the list", async ({ page }) => {
  const amount = Math.floor(100000 + Math.random() * 900000).toString();
  const list = await myinfoPage.addMembership(amount);
  expect(list).toContain(`${amount}.00`);
});




   /**
 * Test Case: TS-8 Verify that a membership can be deleted from the list
 *
 * Objective:
 * Confirm that an existing membership can be removed from My Info > Membership tab
 * and that it no longer appears in the list.
 *
 * Steps:
 * 1. Add a membership with a unique amount.
 * 2. Delete the added membership.
 * 3. Verify the list is not empty and does not contain the deleted amount.
 */
test("TS-8 Verify that a membership can be deleted from the list", async ({ page }) => {
  const amountt = Math.floor(100000 + Math.random() * 900000).toString();
  const amount = `${amountt}.00`
  const List = await myinfoPage.deleteMembership(amount);
  expect(List.length).toBeGreaterThan(0);
   expect(List).not.toContain(`${amount}.00`);
  
});






 /**
 * Test Case: TS-9 Verify that a membership can be edited from the list
 *
 * Objective:
 * Confirm that an existing membership can be updated in My Info > Membership tab
 * and that the updated amount appears in the list.
 *
 * Steps:
 * 1. Open the membership list.
 * 2. Edit the first membership entry.
 * 3. Enter a new amount and save.
 * 4. Verify that the updated amount is displayed.
 */
test("TS-9 Verify that a membership can be edited from the list", async ({ page }) => {
   const newAmount = Math.floor(100000 + Math.random() * 900000).toString();
  const editList= await myinfoPage.editMembership(newAmount);       // Capture and search Employee ID
  expect(editList).toContain(`${newAmount}.00`);    // Validate search result
});







/**
 * Test Case: TS-10 Verify that an attachment can be uploaded in the Memberships subtab
 *
 * Objective:
 * Confirm that a file attachment with a comment can be added under My Info > Membership tab
 * and that the comment appears in the list.
 *
 * Steps:
 * 1. Navigate to the Memberships subtab.
 * 2. Click Add to open the upload form.
 * 3. Upload a file and enter a unique comment.
 * 4. Save the attachment.
 * 5. Verify that the list contains the comment.
 */

test("TS-10 Verify that an attachment can be uploaded in the Memberships subtab", async ({ page }) => {
  const cmnt = generateUniqueComment(); // Generate a unique comment
  const cmntlist = await myinfoPage.addmembershipAttach(cmnt);
  expect(cmntlist).toContain(cmnt) // returns the style string
  });


/**
 * Test Case: TS-11 Verify the Immigration record Add functionality
 *
 * Objective:
 * Confirm that a new immigration record can be added under My Info > Immigration tab
 * and that the record appears in the list.
 *
 * Steps:
 * 1. Generate a unique passport number.
 * 2. Navigate to the Immigration tab.
 * 3. Add a new record with the generated passport number.
 * 4. Verify that the list contains the new record.
 */
test("TS_11_Verify the Immigrant assign immigration record Add Functionality", async ({ page }) => {
  
  const number = `PPN_${Date.now()}`;
  const fileName = await myinfoPage.addImegration(number);     // Trigger download
  expect(fileName).toContain(number);                                 // Assert file was downloaded
});

  
/**
 * Test Case: TS-12 Verify the Immigration record Edit functionality
 *
 * Objective:
 * Confirm that an existing immigration record can be updated in My Info > Immigration tab
 * and that the updated passport number appears in the list.
 *
 * Steps:
 * 1. Navigate to the Immigration tab.
 * 2. Edit the first immigration record.
 * 3. Update the passport number with a new value.
 * 4. Save and verify the updated number in the list.
 */
test("TS-12 Verify the Immigrant assign immigration record Edit Functionality", async ({ page }) => {
  const number = `UPPN_${Date.now()}`; 
  const output = await myinfoPage.editImmigration(number);   
    // Hover and capture class
  expect(output).toContain(number); // Validate class change
});






/**
 * Test Case: TS-13 Verify that an immigration record can be deleted
 *
 * Objective:
 * Confirm that an existing immigration record can be removed from My Info > Immigration tab
 * and that it no longer appears in the list.
 *
 * Steps:
 * 1. Add an immigration record with a unique passport number.
 * 2. Delete the added record.
 * 3. Verify that the list does not contain the deleted passport number.
 */
test("TS-13 Verify the Immigrant assign immigration record Delete Functionality", async ({ page }) => {
  const number = `PPN_${Date.now()}`;
  const msg = await myinfoPage.deleteImmegration(number);
  expect(msg.length).toBeGreaterThan(0);                         // Try to reuse an existing ID
  expect(msg).not.toContain(number); // Convert msg to string and assert

});

/**
 * Test Case: TS-14 Verify the Immigration record 'Delete Selected' functionality
 *
 * Objective:
 * Confirm that multiple immigration records (or a specific record) can be selected via checkbox
 * and deleted successfully from My Info > Immigration tab.
 *
 * Steps:
 * 1. Add a new immigration record with a unique passport number.
 * 2. Select the record using its checkbox.
 * 3. Click the Delete Selected button.
 * 4. Confirm deletion.
 * 5. Verify that the record is no longer in the list.
 */
  test("TS-14 Verify the Immigrant assign immigration record Delete selected Functionality", async ({ page }) => {
    const number = `PPN_${Date.now()}`;
    const Msg = await myinfoPage.checkboxDeleteFunction(number);
    expect(Msg.length).toBeGreaterThan(0); // Ensure something was deleted
    expect(Msg).not.toContain(number); // Delete selected
  });


/**
 * Test Case: TC-15 Verify the My Info's Qualification tab loads successfully
 *
 * Objective:
 * Ensure that the Qualification tab in My Info opens and displays the correct URL.
 *
 * Steps:
 * 1. Navigate to My Info > Qualification tab.
 * 2. Verify that the correct page URL is loaded.
 */
test("TC-15 Verify the My Info's Qualification tab Loads Succesfully", async () => {                            // Step 1: Unique comment
  const list = await myinfoPage.qualificationTabb(); // Step 2–4
  console.log(list);                         // Ensure something was uploaded
  expect(list).toContain("https://yakshahrm.makemylabs.in/orangehrm-5.7/web/index.php/pim/viewQualifications/empNumber/");                                     // Ensure correct comment is present
});




});

/**
 * ------------------------------------------------------Helper Methods----------------------------------------------------
 */

function verifyDownloadedFileExists(filename: string): boolean {
  const filePath = path.join(downloads, filename);
   const files = fs.readdirSync(downloads); // Get all files in the directory
  return files.includes(filename);
}

export function expectPrimaryColorStyle(actual: string) {
  const expected = "background-color: rgb(130, 97, 55); opacity: 1; cursor: pointer;";
  expect(actual.trim()).toBe(expected);
}

async function assertSearchedEmpId(page: Page, expectedEmpId: string) {
  const displayedEmpId = await page.locator("//div[@class='oxd-table-card']//div[@role='cell']").nth(1).textContent();
  expect(displayedEmpId?.trim()).toBe(expectedEmpId);
}

async function assertEditUserHeaderVisible(page: Page) {
  await expect(page.locator("//h6[text()='Edit User']")).toBeVisible();
}

async function assertCommentExists(postedComment: string, cmntList: string[]) {
  expect(cmntList.some((c) => c.trim() === postedComment.trim())).toBe(true);
}

 async function assertLikeCountIncreased(
  initialNumber: number,
  updatedNumber: number
) {
  expect(updatedNumber).toBeGreaterThan(initialNumber);
}

function generateUniqueComment() {
  const timestamp = Date.now(); // current time in milliseconds
  const random = Math.floor(Math.random() * 10000); // random 4-digit number
  return `upload${timestamp}${random}`;
}
function generateUniqueName() {
  const timestamp = Date.now(); // current time in milliseconds
  const random = Math.floor(Math.random() * 100); // random 4-digit number
  return `name${timestamp}${random}`;
}

function assertUrlsContainKeywords(urls: string[], keywords: string[]) {
  for (const keyword of keywords) {
    const matched = urls.some(url => url.toLowerCase().includes(keyword.toLowerCase()));
    expect(matched).toBeTruthy();
  }
}

  async function assertUrl(actualUrl: string, expectedUrl: string) {
  expect(actualUrl).toBe(expectedUrl);
  console.log(`Asserted URL: ${actualUrl}`);
}




async function assertItemPresentInList(
  listText: string,
  expectedItem: string,
  successMessage: string
) {
  await new Promise((r) => setTimeout(r, 2000));
  expect(listText).toContain(expectedItem);
  console.log(successMessage);
}

async function assertExactErrorMessage(
  actualMessage: string,
  expectedMessage: string,
  logMessage: string
) {
  expect(actualMessage).toBe(expectedMessage);
  console.log(logMessage);
}

async function assertSuccessMessageContains(
  actualMessage: string,
  expectedSubstring: string,
  logMessage: string
) {
  expect(actualMessage).toContain(expectedSubstring);
  console.log(logMessage);
}

async function assertDeletionSuccess(
  actualMessage: string,
  expectedText: string = "Successfully Deleted",
  logMessage: string = "User deleted successfully"
) {
  expect(actualMessage).toContain(expectedText);
  console.log(logMessage);
}


