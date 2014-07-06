define(['uuid'], function (uuid) {
	'use strict';

	var createPart = function (categoryId, length) {
		return {
			id: uuid.v4(),
			categoryId: categoryId,
			length: length
		};
	};

	return {
		createPart: createPart
	};

});