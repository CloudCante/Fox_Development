
export function truncateText (text, maxLength=75) {
if (typeof text !== 'string') return '';
return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
};
export function sanitizeText (text){
if (typeof text !== 'string') return '';
return text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
