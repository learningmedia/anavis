import ko from "knockout";
import fwf from "fake-work-factory";
import intempo from "learningmedia/intempojs";

window.ko = ko;

const vm = {};
vm.works = ko.observableArray([fwf.createFakeWork()]);

ko.applyBindings(vm);
