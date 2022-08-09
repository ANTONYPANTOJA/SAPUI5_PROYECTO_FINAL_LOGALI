// @ts-ignore
// @ts-nocheck
sap.ui.define([
    // "sap/ui/core/mvc/Controller",
     "logaligroup/employees/controller/Base.controller",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator",
     "/sap/m/MessageToast"
 ],
     /**
      * @param {typeof sap.ui.core.mvc.Controller} Controller
      */
     function (Base,Filter,FilterOperator,MessageToast) {
         "use strict";
 /*
         return Controller.extend("logaligroup.employees.controller.MainView", {
             onInit: function () {
             },
             onValidate: function(){
                 var objectEmployee = this.byId("Input_01");
                 var valueEmployee = objectEmployee.getValue();
                 if( valueEmployee.length === 6 ){
                     objectEmployee.setDescription("OK");
                     this.byId("slCountry").setVisible(true);
                     this.byId("labelCountry").setVisible(true);
                 }else{
                     objectEmployee.setDescription("Not OK");
                     this.byId("slCountry").setVisible(false);
                     this.byId("labelCountry").setVisible(false);
                 }
             }
         });
 */
 // Método onInit
         function showPostalCode(oEvent){
 
             var itemPressed   = oEvent.getSource();
             var oContext      = itemPressed.getBindingContext("jsonEmployees");
             var objectContext = oContext.getObject();
             
             MessageToast.show(objectContext.PostalCode);
 
         }
         function onFilter(){
 
             var oJSONCountries = this.getView().getModel("jsonCountries").getData();
             console.log(oJSONCountries);
 
             var filters = [];
 
             if(oJSONCountries.EmployeeId !== ""){
                 filters.push( new Filter("EmployeeID",FilterOperator.EQ,oJSONCountries.EmployeeId ));
             }
             if(oJSONCountries.CountryKey !== ""){
                 filters.push( new Filter("Country",FilterOperator.EQ,oJSONCountries.CountryKey ));
             }
 
             var oList = this.getView().byId("_IDGenTable1");
             var oBinding = oList.getBinding("items");
             oBinding.filter(filters)
 
         }
         function onClearFilter(){
             var oModel = this.getView().getModel("jsonCountries");
             oModel.setProperty("/EmployeeId","");
             oModel.setProperty("/CountryKey","");
         }
         function onInit(){
 
             this._bus = sap.ui.getCore().getEventBus();
         }
 
         function onShowCity(){
             var oJsonModelConfig = this.getView().getModel("jsonModelConfig");
             oJsonModelConfig.setProperty("/visibleCity",true);
             oJsonModelConfig.setProperty("/visibleBtnShowCity",false);
             oJsonModelConfig.setProperty("/visibleBtnHideCity",true);
 
 
         }
         function onHideCity(){
             var oJsonModelConfig = this.getView().getModel("jsonModelConfig");
             oJsonModelConfig.setProperty("/visibleCity",false);
             oJsonModelConfig.setProperty("/visibleBtnShowCity",true);
             oJsonModelConfig.setProperty("/visibleBtnHideCity",false);
         }
 
         function showOrders(oEvent){
             var ordersTable = this.getView().byId("ordersTable");
             ordersTable.destroyItems();
 
             var itemPressed = oEvent.getSource();
             var oContext = itemPressed.getBindingContext("jsonEmployees");
 
             var objectContext = oContext.getObject();
             var orders = objectContext.Orders;
 
             var ordersItems = [];
 
             for ( var i in orders) {
                 ordersItems.push( new sap.m.ColumnListItem({
                     cells: [
                         new sap.m.Label({ text: orders[i].OrderID }),
                         new sap.m.Label({ text: orders[i].Freight }),
                         new sap.m.Label({ text: orders[i].ShipAddress })
                     ]
                 }));
             }
             var newTable = new sap.m.Table({
                 width:"auto",
                 columns: [
                     new sap.m.Column({header : new sap.m.Label({text:"{i18n>orderID}" })}),
                     new sap.m.Column({header : new sap.m.Label({text:"{i18n>Freight}" })}),
                     new sap.m.Column({header : new sap.m.Label({text:"{i18n>shipAddress}" })})
                 ],
                 items: ordersItems
             }).addStyleClass("sapUiSmallMargin");
 
             ordersTable.addItem(newTable);
 
             //Otra Forma
 
             var newTableJson = new sap.m.Table();
             newTableJson.setWidth("auto");
             newTableJson.addStyleClass("sapUiSmallMargin");
 
             var columOrderID = new sap.m.Column();
             var labelOrderID = new sap.m.Label();
 
             labelOrderID.bindProperty("text","i18n>orderID")
             columOrderID.setHeader(labelOrderID);
             newTableJson.addColumn(columOrderID);
 
             var columFreight = new sap.m.Column();
             var labelFreight = new sap.m.Label();
 
             labelFreight.bindProperty("text","i18n>Freight")
             columFreight.setHeader(labelFreight);
             newTableJson.addColumn(columFreight);
 
             var columnShipAddress = new sap.m.Column();
             var labelShipAddress = new sap.m.Label();
 
             labelShipAddress.bindProperty("text","i18n>shipAddress")
             columnShipAddress.setHeader(labelShipAddress);
             newTableJson.addColumn(columnShipAddress);
 
             var columnListItem = new sap.m.ColumnListItem
 
             var cellOrderID = new sap.m.Label();
             cellOrderID.bindProperty("text","jsonEmployees>OrderID");
             columnListItem.addCell(cellOrderID);
 
             var cellFreight = new sap.m.Label();
             cellFreight.bindProperty("text","jsonEmployees>Freight");
             columnListItem.addCell(cellFreight);
 
             var cellShipAddress = new sap.m.Label();
             cellShipAddress.bindProperty("text","jsonEmployees>ShipAddress");
             columnListItem.addCell(cellShipAddress);
 
             var oBindinginfo = {
                     model : "jsonEmployees",
                     path: "Orders",
                     template: columnListItem
             };
 
             newTableJson.bindAggregation("items", oBindinginfo);
             newTableJson.bindElement("jsonEmployees>" + oContext.getPath());
 
             ordersTable.addItem(newTableJson);
         }
 
         function showOrders2(oEvent){
 
             //Obtener el controlado de la fila seleccionado
             var iconPressed = oEvent.getSource();
             //Obtener el contexto del modelo
             var oContext = iconPressed.getBindingContext("odataNorthwind");
 
             if (!this._oDialogOrders) {
                 this._oDialogOrders = sap.ui.xmlfragment("logaligroup.employees.fragment.DialogOrders",this);
                 this.getView().addDependent(this._oDialogOrders);
             }
 
             //Realizar el Bindig hacia el dialog table
             this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
             this._oDialogOrders.open();
         }
 
         function onCloseOrders(){
             this._oDialogOrders.close();
         }
 
         function showEmployee(oEvent){
             var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
             this._bus.publish("flexible","showEmployee",path);
         }
 /** Se usara el controlador Base.controller.js
         function toOrderDetails(oEvent){
             var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
             oRouter.navTo("RouteOrderDetails",{
                     OrderID: orderID
             });
         }
 */
 
 //Otra forma de devolver el CONTROLLER.extend ( Esto corrige los errores de Typescript)
     
         var Main = Base.extend("logaligroup.employees.controller.MasterEmployee",{});
         Main.prototype.onValidate = function () {
 
             var objectEmployee = this.byId("Input_01");
             var valueEmployee = objectEmployee.getValue();
             if (valueEmployee.length === 6) {
                 objectEmployee.setDescription("OK");
                 this.byId("slCountry").setVisible(true);
                 this.byId("labelCountry").setVisible(true);
             } else {
                 objectEmployee.setDescription("Not OK");
                 this.byId("slCountry").setVisible(false);
                 this.byId("labelCountry").setVisible(false);
             }
         };
 
         Main.prototype.onInit = onInit;
         Main.prototype.onFilter = onFilter;
         Main.prototype.onClearFilter = onClearFilter;
         Main.prototype.showPostalCode = showPostalCode;
         Main.prototype.showOrders2 = showOrders2;   
         Main.prototype.onShowCity = onShowCity;
         Main.prototype.onHideCity = onHideCity;
         Main.prototype.onCloseOrders = onCloseOrders; 
         Main.prototype.showEmployee = showEmployee; 
       //  Main.prototype.toOrderDetails = toOrderDetails;
         return Main;
 
     });