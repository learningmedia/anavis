// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';



import ko from 'knockout';
import utils from './utils';
import soundDrop from './bindings/sound-drop';
import toolbar from './components/toolbar';
import soundPlayer from './components/sound-player';
import workService from './work-service';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author if this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('greet').innerHTML = greet();
    document.getElementById('platform-info').innerHTML = os.platform();
    document.getElementById('env-name').innerHTML = env.name;
});


window.ko = ko;

// Register all bindings:
[soundDrop].forEach(binding => binding.register());

// Register all components:
[toolbar, soundPlayer].forEach(component => component.register());

const vm = { utils };

document.addEventListener('DOMContentLoaded', function() {
    vm.works = workService.works;
    ko.applyBindings(vm, document.body);
});

