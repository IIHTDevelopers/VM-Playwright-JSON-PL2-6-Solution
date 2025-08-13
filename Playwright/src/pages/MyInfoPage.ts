import { Locator, Page } from "@playwright/test";
import path from "path";
import LoginPage from "./LoginPage";
const filePath = path.resolve(__dirname, "../../sample_upload.pdf");

export class MyInfoPage {
  readonly page: Page;
  private textinput : Locator;
  private addFile : Locator;
  private contactBtn :Locator;
  private saveBtn : Locator;
  private Myinfo: Locator;
  private nameField: Locator;
  private spanMsg: Locator;
  private saveButton: Locator;
  private membershipTab : Locator;
  private addBtn: Locator;
  private dropdwn : Locator;
  private amount: Locator;
  private deletecnfrm: Locator;
  private table : Locator;
  private uploadedFile: Locator;
  private addCmnt: Locator;
  private ImmigrationTab: Locator;
  private psprtNumber : Locator;
  private checkboxDel : Locator;
  private qualificationTab: Locator;
 
  constructor(page: Page) {
    this.page = page;
    this.qualificationTab = page.locator("//a[text()='Qualifications']");
    this.checkboxDel = page.locator("//button[text()=' Delete Selected ']");
    this.psprtNumber = page.locator("//input[@class='oxd-input oxd-input--active']");
     this.ImmigrationTab= page.locator("//a[text()='Immigration']");
    this.addCmnt = page.locator("//textarea[@placeholder='Type comment here']");
    this.uploadedFile = page.locator("//input[@type='file']");
    this.table = page.locator("//div[@class='orangehrm-container']");
    this.deletecnfrm = page.locator("//button[text()=' Yes, Delete ']");
    this.amount = page.locator("input.oxd-input--active");
    this.dropdwn = page.locator("//div[@class='oxd-select-text-input']");
    this.addBtn = page.locator("//button[text()=' Add ']");
    this.membershipTab= page.locator("//a[text()='Memberships']");
    this.saveButton = page.locator("//button[text()=' Save ' ]");
    this.nameField = page.locator('input[name="firstName"]');
    this.spanMsg=  page.locator("//span[text()='Required']");  
    this.textinput = page.locator("//textarea[@placeholder='Type comment here']")
    this.addFile = page.locator("//button[text()=' Add ']");
    this.contactBtn = page.locator("//a[text()='Contact Details']");
    this.Myinfo = page.locator("text=My Info");
    this.saveBtn= page.locator("//button[text()=' Save ' ]");
  }

 

 /**
 * Uploads an attachment with a given comment in the My Info > Contact Details section.
 *
 * @param comnt - A unique comment to associate with the uploaded file.
 * @returns A list of text entries matching the uploaded comments (post-upload).
 */
async UploadAttachmentInDependent(comnt: string) {
  
  await this.Myinfo.click();                                 // Navigate to My Info
  await this.contactBtn.click();                             // Go to Contact Details section
  await this.addFile.click();                                // Click Add Attachment
  await this.textinput.scrollIntoViewIfNeeded();             // Scroll comment input into view
  await this.textinput.fill(comnt);                          // Fill comment

  const fileInput = this.page.locator('input[type="file"]'); // Locate file input
  await fileInput.setInputFiles(filePath);                   // Upload file

  await this.saveBtn.nth(1).click();                          // Click Save
  await this.page.waitForTimeout(6000);                       

  const value = this.page.locator(`//div[text()='${comnt}']`).allInnerTexts();                                         

  return value;
}

 /**
 * Navigates to the "My Info" tab and returns the current page URL..
 */

  async clickMyInfoTab() {
    //await this.Myinfo.click();
    return this.page.url();
  }

  /**
 * Clears the name field and returns validation message, if any..
 */

  async clearAndEnterName(){
    await this.Myinfo.click();
    await this.nameField.click();
    await this.nameField.clear();
    return this.spanMsg.innerText();
  }

  /**
 * Updates the user's name in the "My Info" tab and returns the profile name after saving and reloading..
 */

  async updateUniqueNAmeAndVerifyName(newName: string){
    await this.clickMyInfoTab();
    await this.nameField.click();
    await this.nameField.clear();    
    await this.nameField.fill(newName);
    await this.saveButton.nth(0).click();  
    await this.page.reload();
    await this.page.waitForTimeout(2000);
    const displayedProfileName =await this.page.locator("//p[@class='oxd-userdropdown-name']").innerText();

    return displayedProfileName;
    
  }



  /**
 * Adds a membership with the given amount and returns all amounts from the list.
 */

  async addMembership(amount : string) {
    await this.Myinfo.click();
    await this.membershipTab.click();
    await this.addBtn.nth(0).click();
    await this.dropdwn.nth(0).click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.amount.nth(1).fill(amount);
    await this.saveButton.click();
    await this.page.waitForTimeout(6000);
    return this.page.locator("//div[@role='row']/div[4]").allTextContents();
  }




  /**
 * Adds and then deletes a membership with the given amount.
 * Returns all membership amounts after deletion.
 */
  async deleteMembership(amount: string) {
    await this.Myinfo.click();
    await this.membershipTab.click();
    await this.addBtn.nth(0).click();
    await this.dropdwn.nth(0).click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.amount.nth(1).fill(amount);
    await this.saveButton.click();
    await this.page.waitForTimeout(4000);
    await this.page.locator(`//div[@class='oxd-table-card'][.//div[text()='${amount}.00']]//i[@class='oxd-icon bi-trash']`).click();
    await this.page.waitForTimeout(1000);
    await this.deletecnfrm.click();
    await this.page.waitForTimeout(6000);
    return this.page.locator("//div[@role='row']/div[4]").allTextContents();


  }




  
/**
 * Edits the first membership and updates it with the given amount.
 * Returns all membership amounts after editing.
 */
  async editMembership(newAmount: string) {
    await this.Myinfo.click();
    await this.membershipTab.click();
    const table1 = this.table.nth(0);
    await table1.locator("//i[@class='oxd-icon bi-pencil-fill']").nth(0).click();
    await this.page.waitForTimeout(4000);
    await this.dropdwn.nth(0).click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    await this.amount.nth(1).fill(newAmount);
    await this.saveButton.click();
    await this.page.waitForTimeout(4000);
    return this.page.locator("//div[@role='row']/div[4]").allTextContents();
  }






  /**
 * Uploads an attachment with the given comment in the Memberships subtab.
 * Returns all comments from the attachment list.
 */
  async addmembershipAttach(cmnt : string) {

    await this.Myinfo.click();
    await this.membershipTab.click();
    await this.addBtn.nth(1).click();
    await this.page.waitForTimeout(2000);
    await this.uploadedFile.setInputFiles(filePath);
    await this.page.waitForTimeout(2000);
    await this.addCmnt.fill(cmnt);
    await this.saveButton.click();
    await this.page.waitForTimeout(6000);
    return this.table.nth(1).locator("//div[3]").allInnerTexts();

  }





  /**
 * Adds an immigration record with the given passport number.
 * Returns all passport numbers from the immigration list.
 */
  async addImegration(PPn: string) {

    await this.Myinfo.click();
    await this.ImmigrationTab.click();
    await this.page.waitForTimeout(2000);
    await this.addBtn.nth(0).click();
    await this.page.waitForTimeout(1000);
    await this.psprtNumber.nth(1).fill(PPn);
    await this.saveBtn.click();
    await this.page.waitForTimeout(6000);
    const list = this.page.locator("//div[@role='row']")
    return list.locator("//div[3]").allInnerTexts();

  }



  /**
 * Edits the first immigration record and updates it with the given passport number.
 * Returns all passport numbers from the immigration list.
 */
  async editImmigration(Uppn : string) {
    await this.Myinfo.click();
    await this.ImmigrationTab.click();
    await this.page.waitForTimeout(3000);
    const table1 = this.page.locator("//div[@class='oxd-table-card']");
    await table1.nth(0).locator("//i[@class='oxd-icon bi-pencil-fill']").nth(0).click();
    await this.page.waitForTimeout(2000);
     await this.psprtNumber.nth(0).clear();
     await this.psprtNumber.nth(0).fill(Uppn);
    await this.saveBtn.click();
    await this.page.waitForTimeout(6000);
    const list = this.page.locator("//div[@role='row']")
    return list.locator("//div[3]").allInnerTexts();


  }






  /**
 * Adds and then deletes an immigration record with the given passport number.
 * Returns all passport numbers from the immigration list after deletion.
 */
  async deleteImmegration(PPn: string) {
    await this.Myinfo.click();
    await this.ImmigrationTab.click();
    await this.page.waitForTimeout(2000);
    await this.addBtn.nth(0).click();
    await this.page.waitForTimeout(1000);
    await this.psprtNumber.nth(1).fill(PPn);
    await this.saveBtn.click();
    await this.page.waitForTimeout(6000);
    await this.page.locator(`//div[contains(@class,'oxd-table-card') and contains(.,'${PPn}')]//i[contains(@class,'bi-trash')]`).click();
    await this.page.waitForTimeout(1000);
    await this.deletecnfrm.click();
    await this.page.waitForTimeout(4000);
    const list = this.page.locator("//div[@role='row']")
    return list.locator("//div[3]").allInnerTexts();



  }


  // Navigates to My Info > Qualification tab and returns the page URL
  async qualificationTabb() {
    await this.Myinfo.click();
    await this.qualificationTab.click();
    return this.page.url();

  }






  /**
 * Adds a new immigration record, selects it via checkbox, and deletes it.
 * Returns all passport numbers from the list after deletion.
 */
  async checkboxDeleteFunction(PPn: string) {
    await this.Myinfo.click();
    await this.ImmigrationTab.click();
    await this.page.waitForTimeout(2000);
    await this.addBtn.nth(0).click();
    await this.page.waitForTimeout(1000);
    await this.psprtNumber.nth(1).fill(PPn);
    await this.saveBtn.click();
    await this.page.waitForTimeout(6000);
    await this.page.locator(`//div[contains(@class,'oxd-table-card') and contains(.,'${PPn}')]//i[contains(@class,'bi-check')]`).click();
    await this.checkboxDel.click();
    await this.page.waitForTimeout(1000);
    await this.deletecnfrm.click();
    await this.page.waitForTimeout(6000);
    const list = this.page.locator("//div[@role='row']")
    return list.locator("//div[3]").allInnerTexts();
  }

}
