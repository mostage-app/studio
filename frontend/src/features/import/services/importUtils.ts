/**
 * Import utilities for handling different file formats
 */

/**
 * Parse HTML content to extract text and convert to markdown
 */
export const parseHTMLToMarkdown = (html: string): string => {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll("script, style");
  scripts.forEach((el) => el.remove());

  // Convert HTML to markdown-like format
  let markdown = tempDiv.textContent || "";

  // Clean up whitespace
  markdown = markdown
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return markdown;
};

/**
 * Parse text content and format as markdown
 */
export const parseTextToMarkdown = (text: string): string => {
  // Split by double line breaks to create slides
  const slides = text.split(/\n\s*\n/);

  // Format each slide
  const formattedSlides = slides.map((slide) => {
    const lines = slide.trim().split("\n");
    const formattedLines = lines.map((line) => {
      // Convert to headers if line is short and looks like a title
      if (
        line.length < 50 &&
        line.length > 0 &&
        !line.startsWith("-") &&
        !line.startsWith("*")
      ) {
        return `## ${line}`;
      }
      return line;
    });
    return formattedLines.join("\n");
  });

  return formattedSlides.join("\n\n---\n\n");
};

/**
 * Parse Mostage presentation file
 */
export const parseMostageFile = (
  content: string
): { markdown: string; config?: Record<string, unknown> } => {
  try {
    const data = JSON.parse(content);

    // Check if it's a valid Mostage file
    if (data.type === "mostage-presentation" && data.content) {
      return {
        markdown: data.content,
        config: data.config,
      };
    }

    // Fallback: try to extract content from any JSON
    if (data.content) {
      return {
        markdown: data.content,
        config: data.config,
      };
    }

    throw new Error("Invalid Mostage file format");
  } catch {
    throw new Error("Failed to parse Mostage file");
  }
};

/**
 * Parse PDF content (basic text extraction)
 */
export const parsePDFToMarkdown = (content: string): string => {
  // This is a placeholder - in a real implementation, you'd use a PDF parsing library
  // For now, we'll just return the raw content
  return content;
};

/**
 * Handle file import based on file type
 */
export const handleFileImport = async (file: File): Promise<string> => {
  const content = await file.text();
  const extension = file.name.toLowerCase().split(".").pop();

  switch (extension) {
    case "json":
      // Check if it's a Mostage file
      if (
        file.name.toLowerCase().includes("mostage") ||
        content.includes("mostage-presentation")
      ) {
        const result = parseMostageFile(content);
        return result.markdown;
      }
      // Fallback to text parsing
      return parseTextToMarkdown(content);

    case "md":
    case "markdown":
      return content; // Already markdown

    case "pdf":
      return parsePDFToMarkdown(content);

    case "txt":
      return parseTextToMarkdown(content);

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};

/**
 * Handle multiple files import
 */
export const handleMultipleFilesImport = async (
  files: File[]
): Promise<{
  content: string;
  config?: Record<string, unknown>;
}> => {
  let combinedContent = "";
  let combinedConfig: Record<string, unknown> | undefined = undefined;

  for (const file of files) {
    const result = await handleFileImportWithConfig(file);

    // Combine content
    if (result.content) {
      combinedContent +=
        (combinedContent ? "\n\n---\n\n" : "") + result.content;
    }

    // Use the first config found, or merge if needed
    if (result.config && !combinedConfig) {
      combinedConfig = result.config;
    }
  }

  return {
    content: combinedContent,
    config: combinedConfig,
  };
};

/**
 * Handle file import and return both content and config
 */
export const handleFileImportWithConfig = async (
  file: File
): Promise<{
  content: string;
  config?: Record<string, unknown>;
}> => {
  const fileContent = await file.text();
  const extension = file.name.toLowerCase().split(".").pop();

  switch (extension) {
    case "json":
      // Check if it's a Mostage file
      if (
        file.name.toLowerCase().includes("mostage") ||
        fileContent.includes("mostage-presentation")
      ) {
        const result = parseMostageFile(fileContent);
        return {
          content: result.markdown,
          config: result.config,
        };
      }
      // For regular JSON files, treat as config
      try {
        const config = JSON.parse(fileContent);
        return {
          content: "", // Empty content for config-only files
          config: config,
        };
      } catch {
        throw new Error("Invalid JSON file");
      }

    case "md":
    case "markdown":
      return {
        content: fileContent,
        config: undefined,
      };

    case "pdf":
      return {
        content: parsePDFToMarkdown(fileContent),
        config: undefined,
      };

    case "txt":
      return {
        content: parseTextToMarkdown(fileContent),
        config: undefined,
      };

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};

/**
 * Validate file before import
 */
export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  // Check file type
  const extension = file.name.toLowerCase().split(".").pop();
  const supportedExtensions = [
    "mostage",
    "json",
    "md",
    "markdown",
    "pdf",
    "txt",
  ];

  if (!extension || !supportedExtensions.includes(extension)) {
    return { valid: false, error: "Unsupported file format" };
  }

  return { valid: true };
};
