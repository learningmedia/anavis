module.exports = class PlaySoundHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {
    console.log('key down invoked');
  }

  onKeyUp() {
    const workId = this.appViewModel.currentWork().id();
    const element = document.querySelector(`[data-work-id='${workId}']`);
    const soundPlayerVm = ko.dataFor(element.querySelector('av-sound-player > div'));
    soundPlayerVm.onStartClick();
    console.log('key up invoked')
  }

  check() {
    console.log('check invoked');
  }
}
