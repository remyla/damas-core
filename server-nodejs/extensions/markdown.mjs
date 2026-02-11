import { marked } from 'marked';
import markedAlert from 'marked-alert';
import customHeadingId from 'marked-custom-heading-id';
// todo: support syntax hl
//import { markedHighlight } from "marked-highlight";
marked.use(markedAlert());
marked.use(customHeadingId());

export default {marked};
