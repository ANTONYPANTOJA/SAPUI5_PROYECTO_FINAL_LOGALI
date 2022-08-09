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

            //Obtener los ID's de los wizards

            var id_typeEmployeeStep = this.byId("typeEmployeeStep"); // Form 1
            var id_dataEmployeeStep = this.byId("dataEmployeeStep"); // form 2

            //Validar el tipo de empleado seleccionado
            var obutton_type_employee = oEvent.getSource();
            var type_employee = obutton_type_employee.data("typeEmployee");

            var oModel = {
                salary: "",
                type: 0,
                _typeEmployee: ""
            };

            switch (type_employee) {
                case "interno":
                    oModel._typeEmployee = type_employee;
                    oModel.type = 0;
                    oModel.salary = "24000";
                    break;
                case "autonomo":
                    oModel._typeEmployee = type_employee;
                    oModel.type = 1;
                    oModel.salary = "24000";
                    break;

                case "gerente":
                    oModel._typeEmployee = type_employee;
                    oModel.type = 2;
                    oModel.salary = "70000";
                    break;

                default:
                    break;
            }

            //Set de los datos al modelo crado de forma interna
            this._modelEmployee.setData({
                _typeEmployee: oModel._typeEmployee,
                type: oModel.type,
                salary: oModel.salary
            });

            //Validar el siguiente Paso NEXT STEP
            if (this._wizard.getCurrentStep() === id_typeEmployeeStep.getId()) {
                this._wizard.nextStep();
            } else {
                this._wizard.goToStep(id_dataEmployeeStep);
            }

        },
        validateDNI: function (oEvent) {

            //Validar el DNI para los tipos INTERNO Y GERENTE

            if (this._modelEmployee.getProperty("_typeEmployee") !== "autonomo") {
                var dni = oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        this._modelEmployee.setProperty("/_DniState", "Error");
                    } else {
                        this._modelEmployee.setProperty("/_DniState", "None");
                        this.onEmployeeValidation();//Validar los otros campos
                    }
                } else {
                    this._modelEmployee.setProperty("/_DniState", "Error");
                }
            }
        },
        onEmployeeValidation: function (oEvent) {
            //Validar que los campos este rellenos
            var oModel_employee = this._modelEmployee.getData();
            var onValidation = true;

            //Nombre
            if (!oModel_employee.FirstName) {
                oModel_employee._FirstNameState = "Error";
                onValidation = false;
                return;
            } else {
                oModel_employee._FirstNameState = "None";
            }
            //Apellido
            if (!oModel_employee.LastName) {
                oModel_employee._LastNameState = "Error";
                onValidation = false;
                return;
            } else {
                oModel_employee._LastNameState = "None";
            }
            //DNI
            if (!oModel_employee.Dni) {
                oModel_employee._DniState = "Error";
                onValidation = false;
                return;
            } else {
                oModel_employee._DniState = "None";
            }

            //Fecha
            if (!oModel_employee.CreationDate) {
                oModel_employee._CreationDateState = "Error";
                onValidation = false;
                return;
            }else{
                oModel_employee._CreationDateState = "None";
            }

            //Pasar los datos
            if (onValidation === true) {
                this._wizard.validateStep(this.byId("dataEmployeeStep"));
            }


        },
        onCancel: function () {

        }

    });

});