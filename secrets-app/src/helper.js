export const openInNewTab = url => {
  var win = window.open(url, '_blank');
  win.focus();
};

export const timeout = delay => {
  return new Promise(res => setTimeout(res, delay));
};
