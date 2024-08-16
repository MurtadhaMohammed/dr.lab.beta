const { Dropbox } = require("dropbox");
const { nanoid } = require("nanoid");

const clientKey = "142971062224854";
const accessToken =
  "EAACtSYFUzWoBO4eMomlqvkZB4qhpu0R5Gw4ra1F2O5de0oKa2D91MZBRuZC5brm2SobNsEBRLb7eX3sXlNhZCSwIwxhs9ZA1bUIaUCfGVQ6WZAKD3lV0ZBBGiH1Sw2cswfT1iFvAnHb0II0BvjfDKvM7pRoJVH63vw5XqUuR2iIwQyZBar0O62Q2kZBbmuostyNKLhwNyO0bdfcpxWlz4";

export const ACCESS_TOKEN_DBX =
  "sl.Bn_M9D8aWnj0b_LoRG_luVyZ3IDQDjFWNUtJkRpUmBFh880uLvFtfGilCdUMs8JEQ62VA2fKVS2s2lI_xdf_v4Hp1_WVp0BC7WDQ8_yulcKIqS7GypJthF5DcBo6M7T7w4l7SOad_sfdG_pFjx-u-QY";
export const uploadFileDbx = (file, cb) => {
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    // File is smaller than 150 MB - use filesUpload API
    dbx
      .filesUpload({ path: "/" + file.name, contents: file })
      .then(function (response) {
        cb(response, null);
      })
      .catch(function (error) {
        cb(null, error);
      });
  } else {
    // File is bigger than 150 MB - use filesUploadSession* API
    const maxBlob = 12 * 1024 * 1024; // 8MB - Dropbox JavaScript API suggested chunk size

    var workItems = [];

    var offset = 0;

    while (offset < file.size) {
      var chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }

    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function () {
          return dbx
            .filesUploadSessionStart({ close: false, contents: blob })
            .then((response) => response.result.session_id);
        });
      } else if (idx < items.length - 1) {
        // Append part to the upload session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: idx * maxBlob };
          return dbx
            .filesUploadSessionAppendV2({
              cursor: cursor,
              close: false,
              contents: blob,
            })
            .then(() => sessionId);
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: file.size - blob.size };
          var commit = {
            path: "/" + file.name,
            mode: "add",
            autorename: true,
            mute: false,
          };
          return dbx.filesUploadSessionFinish({
            cursor: cursor,
            commit: commit,
            contents: blob,
          });
        });
      }
    }, Promise.resolve());

    task
      .then(function (result) {
        cb(result, null);
      })
      .catch(function (error) {
        cb(null, error);
      });
  }
  return false;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", file);
  formData.append("type", "application/pdf");
  const url = `https://graph.facebook.com/v18.0/${clientKey}/media`;

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data?.error) return { success: false, ...data };
    else return { success: true, ...data };
  } catch (error) {
    return { success: false, ...error };
  }
};

export const sendMessage = async (type, phone, fileID) => {
  const url = `https://graph.facebook.com/v18.0/${clientKey}/messages`;
  let msgType = {
    template: {
      type: "template",
      template: {
        name: "lab",
        language: { code: "ar" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: "يرجى الرد على الرساله لتصلك النتائج",
              },
            ],
          },
        ],
      },
    },
    document: {
      type: "document",
      document: {
        id: fileID,
        filename: "results.pdf",
        caption: "مختبر العلوم للتحليلات المرضية",
      },
    },
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: `964${phone}`,
      ...msgType[type],
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data?.error) return { success: false, ...data };
    else return { success: true, ...data };
  } catch (error) {
    return { success: false, ...error };
  }
};
