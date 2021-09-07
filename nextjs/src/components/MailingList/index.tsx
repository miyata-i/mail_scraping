//_______________________________________________
//
import type { NextPage } from "next";
import React from "react";
import styled from "styled-components";
import useMailingListAddress from "~/hook/useMailingListAddress";

//_______________________________________________
// component
const Component: NextPage = () => {
  const { mailingList, loading, fn } = useMailingListAddress();

  // メーリングリスト展開
  const mapMailingAddress = mailingList.map((mail) => (
    <tr key={"h_mailing_list_address_" + mail.mail}>
      <td>{mail.mail}</td>
      <td>{mail.comment}</td>
    </tr>
  ));
  return (
    <>
      <button disabled={loading.loading} onClick={fn.MailingListRefresh}>
        リフレッシュ
      </button>
      <button disabled={loading.loading} onClick={fn.MailingListLoad}>
        リロード
      </button>

      <div>{loading.loading ? "通信中" : ""}</div>
      <div>{loading.message.length ? loading.message : ""}</div>
      <Table>
        <tbody>{mapMailingAddress}</tbody>
      </Table>
    </>
  );
};

//_______________________________________________
// style

const Table = styled.table`
  & td {
    border: 1px solid;
  }
`;

export default Component;
