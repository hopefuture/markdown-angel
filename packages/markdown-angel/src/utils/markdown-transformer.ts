// @ts-ignore
import markTwain from 'mark-twain';

export default function(filename: string = '', fileContent: string = '') {
  const markdown = markTwain(fileContent);
  markdown.meta.filename = filename.replace(/\\/g, '/');
  return markdown;
}
