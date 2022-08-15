//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.library} library
     */
    function (Controller,library) {
        "use strict";

        var URLHelper = library.URLHelper;


        return Controller.extend("logaligroup.rrhhemployees.controller.MenuMain", {
            onInit: function () {

            },
            onAfterRendering: function(){
                /* No funciona
                var genericTileFirmarPedido = this.byId("linkFirmarPedido");
                var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
                jQuery("#"+idGenericTileFirmarPedido)[0].id = ""; 
                */
               
            },
            onLinkFirmaPedido: function(){
                URLHelper.redirect("https://5cdb4a90trial-dev-employees-approuter.cfapps.us10.hana.ondemand.com/logaligroupemployees/index.html", true);
            },
            onCreateEmployee: function () {
                
                var routersViews = sap.ui.core.UIComponent.getRouterFor(this);
                routersViews.navTo("CreateEmployee", {} , false );

            },
            onViewEmployee: function(){
                var routerViews_aux = sap.ui.core.UIComponent.getRouterFor(this);
                routerViews_aux.navTo("ViewEmployee", {} , false );
            }
        });
    });