import ko from 'knockout';

export default {
  settings: ko.observableArray([]),
  works: ko.observableArray([{
    id: ko.observable('e8df0341-02fc-4f53-a899-f6ce05dc92d6'),
    name: ko.observable(''),
    parts: ko.observableArray([{
      id: ko.observable('f8ecd740-ab16-4803-a9d3-fbaa994acf96'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('d2c9d457-92a6-40ef-82d9-f7597b8094c3'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('94c069d3-0000-4193-b518-67244b4d9e64'),
      length: ko.observable(50),
      color: ko.observable('maroon'),
      name: ko.observable('Bridge')
    }, {
      id: ko.observable('7b0238f1-a527-44d8-9cb7-b5b0ac9612ba'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }]),
    sound: ko.observable({
      id: ko.observable('25ac7df5-59f2-419e-bf37-bd4744bf7a68'),
      path: ko.observable('')
    })
  }, {
    id: ko.observable('bc3c6b0c-b7b8-4ffc-b544-3bad19149aad'),
    name: ko.observable(''),
    parts: ko.observableArray([{
      id: ko.observable('1e54e7e7-ca49-4e99-b643-e9f046df11b4'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('8c64c947-725e-4290-b037-e5681d2b6a99'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('b9233652-fa19-4f70-8a9e-d8d9f00b3505'),
      length: ko.observable(150),
      color: ko.observable('darkgreen'),
      name: ko.observable('Chorus')
    }, {
      id: ko.observable('6233bbed-c511-4cd0-85ed-78f6ab794be6'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('616c9339-f5e2-4678-9dde-e2599171f11d'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }, {
      id: ko.observable('d4c5242c-44fb-42f8-be61-cab07cee3b0d'),
      length: ko.observable(150),
      color: ko.observable('darkgreen'),
      name: ko.observable('Chorus')
    }, {
      id: ko.observable('13c446fa-78d4-4d1a-a35e-608756282321'),
      length: ko.observable(100),
      color: ko.observable('yellow'),
      name: ko.observable('Verse')
    }]),
    sound: ko.observable({
      id: ko.observable('19217983-93d0-402f-9088-25f5e8d76da2'),
      path: ko.observable('')
    })
  }])
};
