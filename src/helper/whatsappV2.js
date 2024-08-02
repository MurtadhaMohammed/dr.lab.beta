const { Dropbox } = require("dropbox");
const { nanoid } = require("nanoid");

const clientKey = "142971062224854";
const accessToken =
  "EAACtSYFUzWoBO4eMomlqvkZB4qhpu0R5Gw4ra1F2O5de0oKa2D91MZBRuZC5brm2SobNsEBRLb7eX3sXlNhZCSwIwxhs9ZA1bUIaUCfGVQ6WZAKD3lV0ZBBGiH1Sw2cswfT1iFvAnHb0II0BvjfDKvM7pRoJVH63vw5XqUuR2iIwQyZBar0O62Q2kZBbmuostyNKLhwNyO0bdfcpxWlz4";

export const ACCESS_TOKEN_DBX =
  "sl.B6KuoHbKBR1A_kJ3fEQe5Ky6Zf38IPKwCTDzQszbGhBoSM9E7mHdCV-sIN6BujOxMyNp-dC4BhFkjoyfm46Tz9PE5bRBspvDwCulJXzhLxpLgHCXYhR16HAMb2yKtODe_319kEQjkmD9CD8U4urTNi0";
var dbx = new Dropbox({ accessToken: ACCESS_TOKEN_DBX });

const getUrlFromDBX = async (path) => {
  try {
    const response = await fetch(
      "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
      {
        body: JSON.stringify({
          path,
          settings: {
            access: "viewer",
            allow_download: true,
            audience: "public",
            requested_visibility: "public",
          },
        }),
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN_DBX}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
    const data = await response.json();
    if (data?.error) return { success: false, ...data };
    else return { success: true, ...data };
  } catch (error) {
    return { success: false, ...error };
  }
};

export const uploadFileDbx = async (file, cb) => {
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  try {
    let response;

    if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
      // File is smaller than 150 MB - use filesUpload API
      response = await dbx.filesUpload({
        path: "/" + file.name,
        contents: file,
      });
    } else {
      // File is bigger than 150 MB - use filesUploadSession* API
      const maxBlob = 12 * 1024 * 1024; // 12MB - Dropbox JavaScript API suggested chunk size
      let sessionId = null;
      let offset = 0;

      const chunks = [];

      while (offset < file.size) {
        let chunkSize = Math.min(maxBlob, file.size - offset);
        chunks.push(file.slice(offset, offset + chunkSize));
        offset += chunkSize;
      }

      for (let i = 0; i < chunks.length; i++) {
        const blob = chunks[i];

        if (i === 0) {
          // Starting multipart upload of file
          const startResponse = await dbx.filesUploadSessionStart({
            close: false,
            contents: blob,
          });
          sessionId = startResponse.result.session_id;
        } else if (i < chunks.length - 1) {
          // Append part to the upload session
          const cursor = { session_id: sessionId, offset: i * maxBlob };
          await dbx.filesUploadSessionAppendV2({
            cursor: cursor,
            close: false,
            contents: blob,
          });
        } else {
          // Last chunk of data, close session
          const cursor = {
            session_id: sessionId,
            offset: file.size - blob.size,
          };
          const commit = {
            path: "/" + file.name,
            mode: "add",
            autorename: true,
            mute: false,
          };
          response = await dbx.filesUploadSessionFinish({
            cursor: cursor,
            commit: commit,
            contents: blob,
          });
        }
      }
    }

    // // Get a temporary link to the uploaded file
    // const linkResponse = await dbx.filesGetTemporaryLink({
    //   path: response.result.path_lower,
    // });

    // console.log(response)

    const res = await getUrlFromDBX(response.result.id);
    if (res?.url) cb(null, "Error");
    cb(res?.url, null);
  } catch (error) {
    cb(null, error);
  }
};

export const sendWhatsAppMessage = async (to, link) => {
  try {
    const response = await fetch(
      "https://graph.facebook.com/v20.0/142971062224854/messages",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer EAACtSYFUzWoBO3udLDzzY7BVs0myRhVNf3ZC9t65vlMkCqbbEtIViLtM6NZB9tSToKXCZBZALDJBypWvdSsKdtcIKgJZAvdJvZBYw87pm2yiZAZBIu54z00VgTa1fHw0TjwUzvwJ4ZAPFqAhAhzxIZCn3jnxX3xAMxZASVO0XQxxwV5ew0pes0xqPfwUuPIEkU8qmUxzp0vpZAshxnaHMEpNIZBOT0QtZAGADUJtXfHvOiNAZDZD",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `964${to}`,
          type: "template",
          template: {
            name: "lab2",
            language: {
              code: "ar",
            },
            components: [
              {
                type: "body", // This is the body component of the template
                parameters: [
                  {
                    type: "text",
                    text: "العلوم", // Replace with your variable
                  },
                ],
              },
              {
                type: "button",
                sub_type: "url", // Specifies that this is a URL button
                index: "0", // Index of the button (starts from 0)
                parameters: [
                  {
                    type: "text",
                    text: link, // Replace with the actual URL for the button
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};
