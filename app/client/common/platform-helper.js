function isCtrlOrCmdPressed(event) {
  return process.platform === 'darwin' ? event.metaKey : event.ctrlKey;
}

module.exports = { isCtrlOrCmdPressed };
