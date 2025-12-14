/**
 * Interface describing the behavior of an Answer Formatting Service.
 */
export interface IAnswerFormattingService {
  /**
   * Formats an answer string.
   * - Cleans Markdown code block syntax.
   * - Converts Markdown to HTML.
   * - Transforms code blocks and emojis into custom HTML/SVG.
   *
   * @param answer - The answer text in Markdown.
   * @returns The formatted HTML string.
   */
  format(answer: string): Promise<string>;
}
