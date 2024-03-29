//_______________________________________________
// メーリングリストをスクレイピング
import { Page } from "puppeteer";

//_______________________________________________
// 定数
const PAGE_LIMIT = 100;
const DOMAIN = "https://my.zenlogic.jp";
const BASE_URL = DOMAIN + "/configurations/68698/mail/mailing_lists";

export type MailingList = {
  mail: string;
  link: string;
  comment: string;
}[];

export type MailingListItem = {
  mail: string;
  link: string;
  comment: string;
};

//_______________________________________________
// メイン処理

/**
 * メーリングリスト取得
 * @module GetMailingList
 * @param n
 * @returns メーリングリスト
 */
export async function GetMailingList(n: Page): Promise<MailingList> {
  await n.goto(BASE_URL); // メーリングリストのページに移動
  await n.waitForSelector("#limit");

  // ページ数を取得
  const page = await getPageCount(n);
  let list: MailingList = [];
  // 各ページのデータを取得
  for (let i = 0; i < page; i++) {
    list = [...list, ...(await getData(i + 1)(n))];
  }
  return list;
}

/**
 * 件数取得
 * @module getPageCount
 * @param n
 * @returns ページ数
 */
const getPageCount = async (n: Page) => {
  await n.select("#limit", String(PAGE_LIMIT)); // 100件表示に切り替え
  await n.waitForTimeout(3000);
  return await n
    .evaluate(() => {
      const target: any =
        document.querySelectorAll(".mb10 .pagination > ul") || [];
      const count = target[0].childElementCount;

      // １ページだけの場合
      if (count <= 3) {
        return 1;
      }

      // 後ろから3番目のテキストを数字に変換
      return Number(target[0].children.item(count - 3).querySelector("a").text);
    })
    .then((c: number) => c);
};

/**
 * ページを指定してメーリングリストを取得
 * @module getData
 * @param page ページ番号
 * @param limit 表示件数
 * @returns メーリングリスト
 */
const getData =
  (page: number, limit: number = PAGE_LIMIT) =>
  async (n: Page) => {
    await n.goto(BASE_URL + `?limit=${limit}&page=${page}`); // メーリングリストのページに移動
    await n.waitForSelector("#limit");
    return await n.evaluate(() => {
      const DOMAIN = "https://my.zenlogic.jp";
      const data: MailingList = [];

      // Email取得
      const emailList =
        document.querySelectorAll(
          "#data-list td:nth-child(2) .punycode-email"
        ) || [];

      // 詳細へ移動するリンク取得
      const settingLink = document.querySelectorAll(
        "#data-list td:nth-child(5) a"
      );

      // コメント取得
      const commentList = document.querySelectorAll(
        "#data-list td:nth-child(4)"
      );

      // 取得したデータをまとめる
      emailList.forEach((_, index) => {
        data.push({
          link: DOMAIN + (settingLink[index].getAttribute("href") || ""),
          comment: commentList[index].textContent || "",
          mail: emailList[index].textContent || "",
        });
      });
      return data;
    });
  };
