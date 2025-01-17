import { pollForFileData, UploadThingError } from "@uploadthing/shared";
import type { FileData } from "@uploadthing/shared";

const isValidResponse = (response: Response) => {
  if (!response.ok) return false;
  if (response.status >= 400) return false;
  if (!response.headers.has("x-uploadthing-version")) return false;

  return true;
};

export const conditionalDevServer = async (fileKey: string) => {
  if (process.env.NODE_ENV !== "development") return;

  const fileData = await pollForFileData(
    fileKey,
    async (json: { fileData: FileData }) => {
      const file = json.fileData;

      let callbackUrl = file.callbackUrl + `?slug=${file.callbackSlug}`;
      if (!callbackUrl.startsWith("http"))
        callbackUrl = "http://" + callbackUrl;

      console.log("[UT] SIMULATING FILE UPLOAD WEBHOOK CALLBACK", callbackUrl);

      const response = await fetch(callbackUrl, {
        method: "POST",
        body: JSON.stringify({
          status: "uploaded",
          metadata: JSON.parse(file.metadata ?? "{}") as FileData["metadata"],
          file: {
            url: `https://utfs.io/f/${encodeURIComponent(fileKey)}`,
            key: fileKey,
            name: file.fileName,
            size: file.fileSize,
          },
        }),
        headers: {
          "uploadthing-hook": "callback",
        },
      });
      if (isValidResponse(response)) {
        console.log("[UT] Successfully simulated callback for file", fileKey);
      } else {
        console.error(
          "[UT] Failed to simulate callback for file. Is your webhook configured correctly?",
          fileKey,
        );
      }
      return file;
    },
  );

  if (fileData !== null) return fileData;

  console.error(`[UT] Failed to simulate callback for file ${fileKey}`);
  throw new UploadThingError({
    code: "UPLOAD_FAILED",
    message: "File took too long to upload",
  });
};
