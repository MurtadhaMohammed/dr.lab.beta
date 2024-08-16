async function uploadFileToLinode(file) {
  const bucketName = "drlab.us-east-1.linodeobjects.com"; // Replace with your bucket name
  const objectName = file.name; // The name of the file in the bucket
  const token =
    "f856d8d82316f39dd86f2e7c560df90ad4c7e4cebe1acb60d3fe0d5692d4cdc3"; // Replace with your Linode Access Key
  const region = "us-east-1.linodeobjects.com"; // Replace with your region
  const url = `https://drlab.us-east-1.linodeobjects.com/${objectName}`; // Linode S3-compatible endpoint


  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type, // The file MIME type
        'x-amz-acl': 'public-read'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("File uploaded successfully:", response.status);
  } catch (error) {
    console.error("File upload failed:", error);
  }
}

export default uploadFileToLinode;
