const TOOL_KEYUP_WAIT_TIME = 150;

module.exports = class ToolHandler {
  constructor(appViewModel, toolName) {
    this.appViewModel = appViewModel;
    this.toolName = toolName;
  }

  onKeyDown() {
    if (this.isSet) return;
    this.isSet = true;
    window.setTimeout(() => this.check(), TOOL_KEYUP_WAIT_TIME);
  }

  onKeyUp() {
    this.isSet = false;
    if (this.appViewModel.currentSecondaryTool() === this.toolName) {
      this.appViewModel.currentSecondaryTool(null);
    }
  }

  check() {
    if (this.isSet) {
      this.appViewModel.currentSecondaryTool(this.toolName);
    } else {
      this.appViewModel.currentPrimaryTool(this.toolName);
    }
  }
}
