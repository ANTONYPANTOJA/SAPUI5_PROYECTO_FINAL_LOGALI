//@ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller'
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

], function (Controller) {
    'use strict';

    return Controller.extend("logaligroup.rrhhemployees.controller.CreateEmployee", {
        onBeforeRendering: function () {

            //Obtener el identificador del Wizard
            this._wizard = this.byId("createEmployeeWizard");
            //Crear el modelo JSON para el formulario de los datos
            this._modelEmployee = new sap.ui.model.json.JSONModel();
            this.getView().setModel(this._modelEmployee);

            //Lógica para el toolbar en el TOP
            var firstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(firstStep);

            // scroll top
            this._wizard.goToStep(firstStep);

            // invalidate first step
            firstStep.setValidated(false);

        },

        onInit: function () {

        },
        Step2: function (oEvent) {

            //Validar el tipo de empleado seleccionado
            var obutton_type_employee = oEvent.getSource();
            var type_employee = obutton_type_employee.data("typeEmployee");

            var oModel = {
                            salary:"",
                            type:0,
                            typeEmployee:""
            };

            switch (type_employee) {
                case "interno":
                    oModel.typeEmployee = type_employee;
                    oModel.type = 0;
                    oModel.salary = "24000";
                    break;
                case "autonomo":
                    oModel.typeEmployee = type_employee;
                    oModel.type = 1;
                    oModel.salary = "24000";
                    break;
                
                case "gerente":
                    oModel.typeEmployee = type_employee;
                    oModel.type         = 2;
                    oModel.salary       = "70000";
                    break; 

                default:
                    break;
            }

        //Set de los datos
        this._modelEmployee.setData({ typeEmployee  : oModel.typeEmployee,
                                      type          : oModel.type,
                                      salary        : oModel.salary
                                    });

            //Validar el siguiente Paso NEXT STEP
            this._wizard.nextStep();
        },
        onCancel: function () {

        }

    });

});