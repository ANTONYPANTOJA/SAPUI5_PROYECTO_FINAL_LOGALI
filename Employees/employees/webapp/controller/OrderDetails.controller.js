// @ts-ignore

// @ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/routing/History',
    "/sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function(Controller,History,MessageBox,Filter,FilterOperator) {

    function _onObjectMatched(oEvent){

        this.onClearSignature();

        this.getView().bindElement({

            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "odataNorthwind",
            events:{
                    dataReceived: function(oData){
                    _readSignature.bind(this)(oData.getParameter("data").OrderID,oData.getParameter("data").EmployeeID);          
                    }.bind(this)
            }
        });

        const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders("
                           + oEvent.getParameter("arguments").OrderID + ")").getObject();
        if (objContext){       
        _readSignature.bind(this)(objContext.OrderID,objContext.EmployeeID);   
        }    
    }
    function _readSignature(OrderID,EmployeeID) {

        //Read Signature Image
        this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + OrderID + "',SapId='"+ this.getOwnerComponent().SapId  +
                                                        "',EmployeeId='"+ EmployeeID +"')",
                {
                    success: function(data){
                        const signature = this.getView().byId("signature");
                        if( data.MediaContent !== ""){
                            signature.setSignature("data:image/png;base64," + data.MediaContent);
                        }
                    }.bind(this),
                    // @ts-ignore
                    error: function(data){

                    }
                });

        //Bind Files
        this.byId("uploadCollection").bindAggregation("items",{
            path:"incidenceModel>/FilesSet",
   
            filters:[   new Filter("OrderId",FilterOperator.EQ,OrderID),
                        new Filter("SapId",FilterOperator.EQ,this.getOwnerComponent().SapId),
                        new Filter("EmployeeId",FilterOperator.EQ,EmployeeID),

            ],
            template: new sap.m.UploadCollectionItem({
                documentId: "{incidenceModel>attId}",
                visibleEdit: false,
                fileName:"{incidenceModel>FileName}"
            }).attachPress(this.downloadFile)
        });   
    }

    return Controller.extend("logaligroup.employees.controller.OrderDetails",{

        onInit: function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched,this);
        },
        
        // @ts-ignore
        onBack: function(oEvent){

            var oHistory = History.getInstance();
            var SPreviosHash = oHistory.getPreviousHash();

            if(SPreviosHash !== undefined){
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // @ts-ignore
                oRouter.navTo("RouteMain", true);
            }
        },

        // @ts-ignore
        onClearSignature: function(oEvent){
            var signature =  this.byId("signature");
            signature.clear();
        },

        // @ts-ignore
        factoryOrderDetails: function( listID, oContext){

            var contextObject = oContext.getObject();
            contextObject.Currency = "EUR";

            var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if( contextObject.Quantity <= unitsInStock ){
                var objectListItem =  new sap.m.ObjectListItem({
                    title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                    number:"{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false }}",
                    numberUnit:"{odataNorthwind>Currency}"

                });
                return objectListItem;
            }else{
                
                var customListItem = new sap.m.CustomListItem({
                    content: [
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"}),
                            contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}" , state:"Error" }),
                            contentRight: new sap.m.Label({ text: "parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}"})
                        })
                    ]
                });
                return customListItem;
            }
        },
        onSaveSignature: function(oEvent){

            const signature = this.byId("signature");
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            let signaturePng;

            if(!signature.isFill()){
                MessageBox.error(oResourceBundle.getText("fillSignature"));
            } else{
                signaturePng = signature.getSignature().replace("data:image/png;base64,","");
                let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

                let body = {
                        OrderId: objectOrder.OrderID.toString(),
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: objectOrder.EmployeeID.toString(),
                        MimeType: "image/png",
                        MediaContent: signaturePng

                };

                this.getView().getModel("incidenceModel").create("/SignatureSet",body,{
                    success: function(){
                        MessageBox.information(oResourceBundle.getText("signatureSaved"));
                    },
                    error: function(){
                        MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                    }
                });
            }
        },
        onFileBeforeUpload: function(oEvent){
            let fileName = oEvent.getParameter("fileName");
            let objContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: objContext.OrderID + ";" +  this.getOwnerComponent().SapId + ";" + objContext.EmployeeID + ";" +
                       fileName
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },
        onFileChange: function(oEvent){
            let oUplodCollection =  oEvent.getSource();

            //Header Toke CSRRF - CROSS-SITE REQUEST FORGERY

            let oCustomerHeaderToken =  new sap.m.UploadCollectionParameter({
                    name:  "x-csrf-token",
                    value: this.getView().getModel("incidenceModel").getSecurityToken()
            });
            oUplodCollection.addHeaderParameter(oCustomerHeaderToken);
        },
        onFileUploadComplete: function(oEvent){
            oEvent.getSource().getBinding("items").refresh();
        },
        onFileDeleted: function(oEvent){
            var oUplodCollection = oEvent.getSource();
            var Spath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();
            this.getView().getModel("incidenceModel").remove(Spath,{
                success: function(){
                    oUplodCollection.getBinding("items").refresh();
                },
                error: function(){

                }
            });
        },
        downloadFile: function(oEvent){
            const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
            window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + Spath + "/$value");
        }

    });
    
});