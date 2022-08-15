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

    return Controller.extend("logaligroup.rrhhemployees.controller.App", {
        onBeforeRendering: function(){
            this._bus = sap.ui.getCore().getEventBus();
        }
        ,
        onAfterRendering: function(){
            this._bus = sap.ui.getCore().getEventBus();

        },
        onInit: function () {
            this._splitAppEmployee = this.byId("splitMainApp"); //Obtener el ID del contenedor principal
            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("employee","onDarBaja",this.onDarBajaDeleted,this);       

        },
        onSelectEmployee: function (oEvent) {

            this._splitAppEmployee.to(this.createId("detailEmployee"));

            //Obtener los datos del usuario seleccionado

            var context_aux = oEvent.getParameter("listItem").getBindingContext("odataModel");
            this.employeeId = context_aux.getProperty("EmployeeId");

            //Bindig de los campos del modelo a la vista
            var detailEmployee = this.byId("detailEmployee");
            detailEmployee.bindElement("odataModel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");
        },

        onUploadComplete: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            oUploadCollection.getBinding("items").refresh();
        },
        onFileDeleted: function (oEvent) {

            var oUploadCollection = oEvent.getSource();
            var spath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();

            //Delete ODATA

            this.getView().getModel("odataModel").remove(spath, {

                success: function () {
                    MessageBox.success(this.oView.getModel("i18n").getResourceBundle().getText("fileOkDeleted"));
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {
                    MessageBox.error(this.oView.getModel("i18n").getResourceBundle().getText("fileKoDeleted"));
                }
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

        onBeforeUploadStart: function (oEvent) {
            var oCustomerHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },
        downloadFile: function (oEvent) {

            var spath_aux = oEvent.getSource().getBindingContext("odataModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + spath_aux + "/$value");
        },
        onPressBack: function () {
            //Regresamos al menú principal
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteApp", {}, true);//Navegar al menú principal 
        },

        onDarBaja: function (oEvent) {

            var oresourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var contextObj = oEvent.getSource().getBindingContext("odataModel").getObject();
            var onDeleted = false;
            var bus_aux = this._bus;

            MessageBox.information(oresourceBundle.getText("bajaEmployee"),
                {
                    title: oresourceBundle.getText("bajaEmployeeConfirm"),
                    onClose: function (oAction) {
                        if (oAction === 'OK') {
                            onDeleted = true;
                            bus_aux.publish("employee","onDarBaja",{ SapId: contextObj.SapId,
                                                                     EmployeeId: contextObj.EmployeeId
                            });
                        }
                    }
                });
         /*
            if (onDeleted === true) {
                //Llamar al Odata para eliminar los datos
                this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {

                    success: function () {
                        MessageToast.show(oresourceBundle.getText("bajaEmployeeOk"));
                        this._splitAppEmployee.to(this.createId("detailSelect"));
                    }.bind(this),
                    error: function (e) {
                        sap.base.Log.info(e);
                    }.bind(this)
                });
            }
            */

        },
        onDarBajaDeleted: function(channelID,eventID,data){
            this.getView().setBusy(true);
            var oresourceBundle = this.getView().getModel("i18n").getResourceBundle();
                 //Llamar al Odata para eliminar los datos
                 this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {

                    success: function () {
                        MessageToast.show(oresourceBundle.getText("bajaEmployeeOk") + data.EmployeeId );
                        this._splitAppEmployee.to(this.createId("detailSelect"));
                    }.bind(this),
                    error: function (e) {
                        sap.base.Log.info(e);
                    }.bind(this)
                });
                this.getView().setBusy(false);

        }
    });

});