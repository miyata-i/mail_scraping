import puppeteer, { Page } from "puppeteer";
import { Socket } from "socket.io";

import { LoginZenlogic } from "~/util/mailingList/login/LoginZenlogic";
import { GetEmailList } from "~/util/mailingList/mail/GetEmailList";
import { LoadEmailList } from "~/util/mailingList/mail/LoadEmailList";
import { SaveEmailList } from "~/util/mailingList/mail/SaveEmailList";
import { MailingList } from "~/util/mailingList/mailingList/GetMailingList";
import { SetTimeStamp } from "~/util/mailingList/timestamp/SetTimeStamp";

/**
 * メーリングリスト更新
 * @module Main
 * @param socket ソケット
 */
const Main = (socket?: Socket) => async (_: MailingList) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  try {
    socket &&  socket.emit("process", "ログイン中");
    await LoginZenlogic()(page); // サイトにログイン
    const allList = await getMailListSub(page, _, socket); // メールリスト取得
    socket && socket.emit("process", "メーリングリスト保存中");
    await SaveEmailList(allList); // メールリスト保存
    socket && socket.emit("complete", allList); // 結果Return
    socket && socket.disconnect(); // 接続解除
  } catch (error) {
    // エラー処理
    console.log(error);
    socket && socket.emit("error", error);
  } finally {
    page.close();
    socket && socket.disconnect();
  }
  return;
};

/**
 * メーリングリスト取得
 * @module getMailListSub
 * @param n ログイン済みのNightmare
 * @param _ 更新するメーリングリストの配列
 * @param socket ソケット
 * @returns 更新後のメーリングリスト
 */
async function getMailListSub(n: Page, _: MailingList, socket?: Socket) {
  const allList = await LoadEmailList(); // 既存のメールリストを読み込み

  let count = 0; // 何件目を取得しているかのカウント
  const length = _.length; // 更新する件数
  
  const mailTimeStamp = SetTimeStamp("mail")

  for (const mail of _) {
    socket &&  socket.emit(
      "process",
      `メーリングリスト取得中(${++count}/${length}) ${mail.link}`
    ); // 何件目を取得しているかのメッセージをクライアントに送信

    // メールリストを取得して既存のリストを上書き
    allList[mail.mail] = await GetEmailList(mail.link)(n);
    mailTimeStamp(mail.mail)
    console.log(allList[mail.mail]);
  }
  return allList;
}

export default Main;
