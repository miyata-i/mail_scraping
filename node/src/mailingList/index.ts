//_______________________________________________
// メールリストを取得するまでの一連の処理
import Puppeteer from "puppeteer";
import { LoginZenlogic } from "./login/LoginZenlogic";
import { GetEmailList, EmailList } from "./mail/GetEmailList";
import { SaveEmailList } from "./mail/SaveEmailList";
import { GetMailingList } from "./mailingList/GetMailingList";
import { LoadMailingList } from "./mailingList/LoadMailngList";
import { SaveMailingList } from "./mailingList/SaveMailingList";

//_______________________________________________
// メイン処理
export const MailingList = async (): Promise<void> => {
  const browser = await Puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  let mailingList = await LoadMailingList();

  await LoginZenlogic()(page); // ログイン

  if (!mailingList.length) {
    mailingList = await GetMailingList(page); // メーリングリスト一覧を取得
  }

  void SaveMailingList(mailingList);

  const result: { [s: string]: EmailList } = {};
  for (const mail of mailingList) {
    result[mail.mail] = await GetEmailList(mail.link)(page);
  }
  void SaveEmailList(result);

  Object.keys(result).forEach((key) => {
    console.table(result[key]);
  });
  return;
};
