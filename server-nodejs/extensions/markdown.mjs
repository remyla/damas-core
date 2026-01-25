import { marked } from 'marked';
import markedAlert from 'marked-alert';
// todo: support syntax hl
//import { markedHighlight } from "marked-highlight";
marked.use(markedAlert());

export default {marked};
