import { describe, it, expect } from 'vitest';
import AnswerFormatingService from '../../services/AnswerFormatingService';

describe('AnswerFormatingService', () => {
    describe('format', () => {
        it('should format a simple Markdown answer correctly', async () => {
            const input = 'This is a **bold** text.'
            const expectedOutput = '<p>This is a <strong>bold</strong> text.</p>\n'
            const answerFormatingService = new AnswerFormatingService()
            const result = await answerFormatingService.format(input)
            expect(result).toBe(expectedOutput)
        });

        it('should handle code blocks correctly', async () => {
            const input = 'Here is some code:\n```javascript\nconsole.log("Hello World");\n```'
            const expectedOutput = `<p>Hereissomecode:</p><div class="codeBlock">
                        <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">Javascript</span></div>
                        <div class="body" onClick="((event) => {if(event.currentTarget) navigator.clipboard.writeText(event.currentTarget.innerText)})(event)"><pre><code class="language-javascript">console.log(&quot;Hello World&quot;);</code></pre></div>
                    </div>`
            const answerFormatingService = new AnswerFormatingService()
            const result = await answerFormatingService.format(input)
            expect(result.replace(/\s+/g, '')).toContain(expectedOutput.replace(/\s+/g, ''))
        });

        it('should handle markdown blocks correctly', async  () => {
            const input = 'Here is some markdown:\n```markdown\nSome markdown content\n```\nAnd more text.'
            const expectedOutput = `<p>Here is some markdown:</p><p>Some markdown content</p><div class="textBlock"><div class="body"><pre><code>And more text.</code></pre></div></div>`
            const answerFormatingService = new AnswerFormatingService()
            const result = await answerFormatingService.format(input)

            expect(result.replace(/\s+/g, '')).toContain(expectedOutput.replace(/\s+/g, ''))
        });
    });
});