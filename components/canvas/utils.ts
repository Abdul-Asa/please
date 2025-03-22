import mammoth from "mammoth";
import { marked } from "marked";

// Read the content of a file
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
    } else if (file.type.startsWith("text/")) {
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        const html = text
          .split("\n")
          .map((line) => `<p>${line}</p>`)
          .join("");
        resolve(html);
      };
    } else if (
      extension === "docx" ||
      file.type.startsWith(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
    } else if (extension === "md") {
      reader.readAsText(file);
      reader.onload = () => {
        const markdown = reader.result as string;
        const html = marked(markdown);
        resolve(html);
      };
    } else {
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        resolve(text);
      };
    }

    reader.onerror = (error) => reject(error);
  });
};
