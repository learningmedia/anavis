module.exports = class HelpScreenHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {
  }

  onKeyUp() {
    this.appViewModel.isHelpScreenVisible(!this.appViewModel.isHelpScreenVisible());
  }
}
