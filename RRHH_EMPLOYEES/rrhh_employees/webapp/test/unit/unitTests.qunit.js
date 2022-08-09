/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"logaligroup/rrhh_employees/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
