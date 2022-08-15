//@ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter"
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         * @param {typeof sap.m.MessageBox} MessageBox
         * @param {typeof sap.m.MessageToast} MessageToast
         * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
         */

], function (Controller, MessageBox, MessageToast, UploadCollectionParameter) {
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
                        //this.onEmployeeValidation();//Validar los otros campos
                        //return true;
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
            } else {
                oModel_employee._CreationDateState = "None";
            }

            //Pasar los datos
            if (onValidation === true) {
                this._wizard.validateStep(this.byId("dataEmployeeStep"));
            }


        },
        wizardCompletedHandler: function (oEvent) {

            //Se navega a la página review
            var wizardNavContainer = this.byId("wizardNavContainer");
            wizardNavContainer.to(this.byId("ReviewPage"));

            //Obtener los archivos cargados
            var uploadCollection = this.byId("UploadCollection");
            var files = uploadCollection.getItems();
            var numFiles = uploadCollection.getItems().length;
            this._modelEmployee.setProperty("/_numFiles", numFiles);

            if (numFiles > 0) {
                var arrayFiles = [];
                for (var i in files) {
                    arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                }
                this._modelEmployee.setProperty("/_files", arrayFiles);
            } else {
                this._modelEmployee.setProperty("/_files", []);
            }



            //Binding the Elements
            //var txtTypeEmployee = this.getById("txtTypeEmployee");
            //txtTypeEmployee.bindProperty("value", "/_typeEmployee");

            //this._modelEmployee.bind(this);

        },
        stepEdit: function (id_step) {
            var wizardNavContainer = this.byId("wizardNavContainer");
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(id_step));
                //Se quita la función para que no vuelva a ejecutar al volver a navegar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        },
        pasoOne: function () {
            this.stepEdit.bind(this)("typeEmployeeStep");
        },
        pasoTwo: function () {
            this.stepEdit.bind(this)("dataEmployeeStep");
        },
        pasoThree: function () {
            this.stepEdit.bind(this)("dataInfoAdicional");
        },
        onCancel: function () {

            MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Regresamos al menú principal
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteApp", {}, true);//Navegar al menú principal
                    }
                }.bind(this)
            });

        },
        onSaveEmployee: function () {

            var dataJson = this.getView().getModel().getData();

            var inputDataBody = {
                SapId: this.getOwnerComponent().SapId,
                Type: parseInt(dataJson.type).toString(),
                FirstName: dataJson.FirstName,
                LastName: dataJson.LastName,
                Dni: dataJson.Dni,
                CreationDate: dataJson.CreationDate,
                Comments: dataJson.comentario
            };

            //Rellenar el Salary
            inputDataBody.UserToSalary = [{
                Amount: parseFloat(dataJson.salary).toString(),
                Comments: dataJson.comentario,
                Waers: "EUR"
            }];

            this.getView().setBusy(true);
            //console.log(inputDataBody);

            //Llamar a la función POST - CREATE del Odata
            this.getView().getModel("odataModel").create("/Users", inputDataBody, {

                success: function (data) {
                    //console.log("ok:" + data);
                    this.getView().setBusy(false);
                    this.idUser = data.EmployeeId;
                    MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNew") + ": " + this.idUser,

                        {
                            onClose: function () {

                                //Volver al Menú
                                var wizardNavContainer = this.byId("wizardNavContainer");
                                wizardNavContainer.back();

                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("RouteApp", {}, true);


                            }.bind(this)
                        });
                        this.onStartUpload();// función "upload" del uploadCollection

                }.bind(this),
                error: function (e) {
                    this.getView().setBusy(false);
                    console.log("error:" + e);
                    MessageToast.show(this.oView.getModel("i18n").getResourceBundle().getText("odataSaveKO"));
                }.bind(this)
            });

        },
        onChange: function (oEvent) {

            var oUploadCollection = oEvent.getSource();
            // Header Token
            var oCustomerHeaderToken = new UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()
            });

            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

        },
        onBeforeUploadStart: function(oEvent){

            var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.idUser+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            console.log(oCustomerHeaderSlug);
	  
        },
        onStartUpload: function(){
	    var oUploadCollection = this.byId("UploadCollection");
	        oUploadCollection.upload();
        }

    });

});