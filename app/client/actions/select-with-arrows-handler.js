module.exports = class SelectWithArrowsHandler {
  constructor(appViewModel, direction) {
    this.appViewModel = appViewModel;
    this.direction = direction;
  }

  onKeyDown() {}

  onKeyUp() {
    if (this.appViewModel.works().length === 0) return;
    let lastIndex = this.appViewModel.works().length - 1;

    let currentWork = this.appViewModel.currentWork();

    if (!currentWork && this.direction === 'up') {
      this.appViewModel.currentPart(this.appViewModel.works()[0].parts()[0]);
      return;
    }
    if(!currentWork && this.direction === 'down') {
      this.appViewModel.currentPart(this.appViewModel.works()[lastIndex].parts()[0]);
      return;
    }

    let index = this.appViewModel.works().indexOf(currentWork);
    switch(this.direction) {
      case 'up':
        if (index === 0) return;
        this.appViewModel.currentPart(this.appViewModel.works()[index - 1].parts()[0]);
        break;
      case 'down':
        if(index === lastIndex) return;
        this.appViewModel.currentPart(this.appViewModel.works()[index + 1].parts()[0]);
        break;
    }
  }
}
