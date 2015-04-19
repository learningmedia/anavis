import ko from "knockout";
import fwf from "fake-work-factory";

const works = ko.observableArray([fwf.createFakeWork(), fwf.createFakeWork()]);

export default works;
