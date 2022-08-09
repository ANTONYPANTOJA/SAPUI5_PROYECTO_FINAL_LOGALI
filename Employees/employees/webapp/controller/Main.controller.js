// @ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageBox'
    /**
     *  @param {typeof sap.ui.core.mvc.Controller} Controller
     */
], function (Controller,MessageBox) {

    return Controller.extend("logaligroup.sapui5.controller.app", {

        onBeforeRendering: function(){

           // this._detailEmployeeView = this.getView().byId("detailEmployeeView");
           
           this._detailEmployeeView = this.getView().byId("detailEmployeeView");
        },

        onInit: function () {
           
         // this._detailEmployeeView = this.getView().byId("detailEmployeeView");

            var oview        = this.getView();
            //         var i18nBundle   = oview.getModel("i18n").getResourceBundle(); 
           
                       // @ts-ignore
                       var objJsonModelEmpl = new sap.ui.model.json.JSONModel;
                       //objJsonModelEmpl.loadData("./localService/mockdata/Employees.json",false);
                       objJsonModelEmpl.loadData("./model/json/Employees.json",false);
                       oview.setModel(objJsonModelEmpl,"jsonEmployees");
           
                       var objJsonModelCoun = new sap.ui.model.json.JSONModel;
                       objJsonModelCoun.loadData("./model/json/Countries.json",false);
                       oview.setModel(objJsonModelCoun,"jsonCountries");

                       var objJsonModelLayout = new sap.ui.model.json.JSONModel;
                       objJsonModelLayout.loadData("./model/json/Layout.json",false);
                       oview.setModel(objJsonModelLayout,"jsonLayout");
                       
                       var ojsonModelConfig = new sap.ui.model.json.JSONModel({
                               visibleId: true,
                               visibleName: true,
                               visibleCountry: true,
                               visibleCity: false,
                               visibleBtnShowCity: true,
                               visibleBtnHideCity: false,
                       });
           
                       oview.setModel(ojsonModelConfig,"jsonModelConfig");

                       //Add
                       this._bus = sap.ui.getCore().getEventBus();
                       this._bus.subscribe("flexible","showEmployee",this.showEmployeeDetails,this);
                       this._bus.subscribe("incidence","onSaveIncidence",this.onSaveOdataIncidence,this);

                       this._bus.subscribe("incidence","onDeleteIncidence",function(channelID,eventID,data){

                        var oresourceBundle = this.getView().getModel("i18n").getResourceBundle();
                        this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId + 
                                                                     "',SapId='" + data.SapId + 
                                                                     "',EmployeeId='"  + data.EmployeeId + "')" ,
                    
                    {
                        success: function(){
                            this.onReadOdataIncidence.bind(this)(data.EmployeeId);
                            sap.m.MessageToast.show(oresourceBundle.getText("odataDeleteOK"));
                            console.log("odataDeleteOK");     
                        }.bind(this),
                        error: function(e){
                            sap.m.MessageToast.show(oresourceBundle.getText("odataDeleteKO"));
                        }.bind(this)
                    });

                       },this);

        },
        showEmployeeDetails: function(category,nameEvent,path){

            var detailView = this.getView().byId("detailEmployeeView"); 
            detailView.bindElement("odataNorthwind>" + path);

            this.getView().getModel("jsonLayout").setProperty("/ActiveKey","TwoColumnsMidExpanded");

            var incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel,"incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();

            this.onReadOdataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);
        },

        onSaveOdataIncidence: function(channelID,eventID,data){

            var oresourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var employeeID = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
            var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

            if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined' ) {
                
          
            var body = {
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: employeeID.toString(),
                CreationDate:incidenceModel[data.incidenceRow].CreationDate,
                Type:incidenceModel[data.incidenceRow].Type,
                Reason: incidenceModel[data.incidenceRow].Reason
            };

            this.getView().getModel("incidenceModel").create( "/IncidentsSet",body,{

                success: function(){
                    this.onReadOdataIncidence.bind(this)(employeeID);
                 MessageBox.success(oresourceBundle.getText("odataSaveOK"));
                 // sap.m.MessageToast.show(oresourceBundle.getText("odataSaveOK"));
                }.bind(this),
                error: function(e){
                    sap.m.MessageToast.show(oresourceBundle.getText("odataSaveKO"));
                }.bind(this)
            });
        }else if ( incidenceModel[data.incidenceRow].CreationDateX || 
                   incidenceModel[data.incidenceRow].TypeX ||
                   incidenceModel[data.incidenceRow].ReasonX ) {
            
                    var body = {
                        CreationDate:incidenceModel[data.incidenceRow].CreationDate,
                        CreationDateX:incidenceModel[data.incidenceRow].CreationDateX,
                        Type:incidenceModel[data.incidenceRow].Type,
                        TypeX:incidenceModel[data.incidenceRow].TypeX,
                        Reason: incidenceModel[data.incidenceRow].Reason,
                        ReasonX: incidenceModel[data.incidenceRow].ReasonX
                    };

                    this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId + 
                                                                     "',SapId='" + incidenceModel[data.incidenceRow].SapId + 
                                                                     "',EmployeeId='"  + incidenceModel[data.incidenceRow].EmployeeId + "')" ,
                    
                    body,{
                        success: function(){
                            this.onReadOdataIncidence.bind(this)(employeeID);
                            sap.m.MessageToast.show(oresourceBundle.getText("odataUpdateOK"));     
                        }.bind(this),
                        error: function(e){
                            sap.m.MessageToast.show(oresourceBundle.getText("odataUpdateKO"));
                        }.bind(this)
                    });


        }else{
            sap.m.MessageToast.show(oresourceBundle.getText("odataNoChanges"));  
        }
        
        },
        onReadOdataIncidence: function(employeID){

            this.getView().getModel("incidenceModel").read("/IncidentsSet",{
                
                filters: [
                        new sap.ui.model.Filter("SapId","EQ",this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId","EQ",employeID.toString())
                ],
                success: function(data){
                    console.log(data);

                    var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                    incidenceModel.setData(data.results);
                    var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                    tableIncidence.removeAllContent();

                    for( var incidence in data.results){

                        data.results[incidence]._ValidateDate = true;
                        data.results[incidence].EnabledSave = true;

                        var newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence",this._detailEmployeeView.getController());
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + incidence);
                        tableIncidence.addContent(newIncidence);
                    }

                }.bind(this),
                error: function(e){
                    console.log(e);
                }
            
            });

        }

    });
});