const onFormSubmit = (e) => {
  // targetDateから年を取得し、その名前からフォルダオブジェクトを取得する
  const FOLDER_ID = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');;
  const targetFolder = DriveApp.getFolderById(FOLDER_ID)
  // GoogleFormの回答を取得
  // NOTE: 質問の順番を変えたりした場合はこちらにも影響が出るので注意
  const itemResponses = e.response.getItemResponses();
  const byName = itemResponses[0].getResponse();
  const targetDate = itemResponses[1].getResponse();
  const column = itemResponses[2].getResponse();
  const amount = itemResponses[3].getResponse();
  let uploadFileId;
  if (itemResponses[4]) {
    uploadFileId = itemResponses[4].getResponse();
    // targetDateから年と月を取得する
    const date = targetDate.split("-");
    const targetDateFolderName = date[0] + "/" + ("0" + date[1]).slice(-2);
    // フォルダの存在チェックをしてyyyy/mmのフォルダがなければ作成する
    if (!targetFolder.getFoldersByName(targetDateFolderName).hasNext()) {
      targetFolder.createFolder(targetDateFolderName);
    }
    const targetDateFolder = targetFolder.getFoldersByName(targetDateFolderName).next();
    const targetFile = DriveApp.getFileById(uploadFileId);
    targetDateFolder.addFile(targetFile);
    targetFile.getParents().next().removeFile(targetFile);
  }

  // Slackへ通知
  const conditions = {
    text:
      `${byName}さんから会計が登録されました\n日付:${targetDate}\n項目:${column}\n金額:${amount}`,
    title: "会計通知"
  };
  sendSlack(conditions);
}


const sendSlack = (conditions) => {
  const url = PropertiesService.getScriptProperties().getProperty(
    "WEB_HOOK_URL"
  );
  const channel = PropertiesService.getScriptProperties().getProperty(
    "SLACK_CHANNEL"
  );
  const user = PropertiesService.getScriptProperties().getProperty(
    "SLACK_USER"
  );
  const data = {
    attachments: [
      {
        color: "#d23546",
        text: conditions.text,
        title: conditions.title
      }
    ],
    channel: channel,
    username: user
  };
  const payload = JSON.stringify(data);
  const options = {
    contentType: "application/json",
    method: "post",
    payload
  };

  UrlFetchApp.fetch(url, options);
}