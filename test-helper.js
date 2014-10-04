'use strict';

function getDependency(name) {
  let dependency;
  let fun = ($injector) => {
    dependency = $injector.get(name);
  };
  fun.$inject = ['$injector'];
  inject(fun);
  return dependency;
}
