//Start jQuery--------------------------------------------------------------------------------------
//Google maps jQuery plugin: https://code.google.com/p/jquery-ui-map/
// gmaps.js: https://hpneo.github.io/gmaps/

//Run functions when the page is fully loaded including graphics
//$(document).on('pagebeforeshow', '#pageone', function(){       
$(document).on('pageshow', '#pageone', function(){       

  //Calculate height of elements based on screen size
  $('#pageone').height($(window).height()); //max page to window
  $('#theMapHolder').height($(window).height() - $("[data-role=header]").outerHeight()); //content - header
  $('#POI').height($(window).height() - $("[data-role=header]").outerHeight());  //content - header
  $('#rightPane').height($(window).height() - $("[data-role=header]").outerHeight() - $('#headerPOI').outerHeight());  //content - header - POI header



  // Reload page when the device is turned
  $( window ).on( "orientationchange", function( event ) {
    window.location.reload();  //or resize elements
  });

  //POI Toggle Function
  $('.show').click(
    function () {
        if ($('#POI').outerWidth() > 0) {
            closePOI();  //close POI panel
        } else {
            openPOI();  //open POI panel
        }
    
    });

  //Start with map max size (otherwise blank tiles), then toggle POI panel open
 // $('.show').click();
 //Wait for map to load before sliding panel  

  //Close menu , open POI ----------------------------------
      $('.show_NewSitesTab').click(
        function () {
         //close open Menu panel with data-rel="close"
            if ($('#POI').outerWidth() == 0) {
                openPOI();  //open POI panel
            }
            //Make tab active - dojo
           dijit.byId("rightTabs").selectChild("NewSitesTab") 
      });

      $('.show_ExistingSitesTab').click(
        function () {
         //close open Menu panel with data-rel="close"
            if ($('#POI').outerWidth() == 0) {
                openPOI();  //open POI panel
            }
            //Make tab active - dojo
           dijit.byId("rightTabs").selectChild("ExistingSitesTab") 
      });

      $('.show_AmenitiesTab').click(
        function () {
         //close open Menu panel with data-rel="close"
            if ($('#POI').outerWidth() == 0) {
                openPOI();  //open POI panel
            }
            //Make tab active - dojo
           dijit.byId("rightTabs").selectChild("AmenitiesTab") 
      });

      $('.show_CultureTab').click(
        function () {
         //close open Menu panel with data-rel="close"
            if ($('#POI').outerWidth() == 0) {
                openPOI();  //open POI panel
            }
            //Make tab active - dojo
           dijit.byId("rightTabs").selectChild("CultureTab") 
      });

  //end open POI---------------------------------------------

  function openPOI() {
    //open POI panel
    $('#theMap').animate({
        'width': $(window).width() - 325 + 'px'
    }, 600);
    $('#POI').animate({
        'width': '325px'
    }, 600);
  }

  function closePOI() {
    //close POI panel
    $('#theMap').animate({
        'margin-right': '0' ,
        'width': '100%'
    }, 600);
    $('#POI').animate({
        'width': '0'
    }, 600);
  }

});     //end wait for page load

//End jQuery--------------------------------------------------------------------------------------

  var gmap = null; //map
  var overlay;  //to get map pixel location
  var bounds;  //map extent
  var dialog;  //lightbox
  var array_Markers = [];  //array for clickable side panel link with map markers
  var markerGeoLocation;  //geolocation marker

  var panorama;   //street view
  var currentLat;
  var currentLong;

  var myRotate; //45-degree image rotate

  var dataAll;  //data file

  //Counters for symbol numbers
  var theMixedUseCount = 1;
  var theResidentialCount = 1;
  var theAmenitiesCount = 1;
  var theCommercialCount = 1;
  
  //=== Set marker attributes ===
  //create markers: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
    var shadow = new google.maps.MarkerImage('images/mapIcons/mm_20_shadow.png',
        new google.maps.Size(22, 20),
        new google.maps.Point(0,0),
        new google.maps.Point(0, 20));
    var shape = {
        coord: [1, 1, 1, 20, 18, 20, 18 , 1],
        type: 'poly'
        };
    var imageOver = new google.maps.MarkerImage('images/mapIcons/highlight.png',
        new google.maps.Size(12, 20),
        new google.maps.Point(0,0),
        new google.maps.Point(0, 20));

  function initialize() {
    var myLatlng = new google.maps.LatLng(47.250138520439556, -122.47643585205077); //Starting map center

    var myOptions = {
      zoom: 12,
      center: myLatlng,
      panControl: true,
      rotateControl: true,
      zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL,
          position: google.maps.ControlPosition.RIGHT_TOP
        },
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      overviewMapControl: false,
      //mapTypeId: google.maps.MapTypeId.ROADMAP
      mapTypeId: google.maps.MapTypeId.HYBRID
    }

    gmap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    //ADD SEARCH BOX HERE - https://developers.google.com/maps/documentation/javascript/examples/places-searchbox

    // Get the map's default Street View panorama - Note that we don't yet set it visible.
    panorama = gmap.getStreetView();

    //Add Geolocate as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 10px 5px 5px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'rgba(102,102,102,0.80)';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.borderColor = '#D2D4D7';
      controlUI.style.cursor = 'pointer';
      controlUI.style.width = '26px';
      controlUI.style.height = '26px';

      
      //Add image to control
      var myLogo = document.createElement("img");
          myLogo.src = "images/locate.png";
          myLogo.style.width = '20px';
          myLogo.style.height = '20px';
          myLogo.style.margin = '3px 0px 0px 3px';
          myLogo.title = "Find my location";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add control to map
      gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

      // Set click event
      google.maps.event.addDomListener(controlUI, 'click', function() {
          if (navigator.geolocation) {

              navigator.geolocation.getCurrentPosition(function (position) {

                //https://github.com/esri/html5-geolocation-tool-js
                //console.error(position.coords.accuracy);  //meters

                //Toogle current location marker  
                if (markerGeoLocation) {
                    //Remove any previous geolocate marker
                    markerGeoLocation.setMap(null); //remove from map
                    markerGeoLocation = null; //empty
                
                } else {
                    //add marker
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    // Create a marker and center map on user location
                    markerGeoLocation = new google.maps.Marker({
                        position: pos,
                        icon: "images/location.png",
                        opacity: 0.75,
                        animation: google.maps.Animation.BOUNCE,
                        map: gmap
                    });

                    gmap.setZoom(19);
                    gmap.setCenter(pos);
                    //for mobile phones may want to slide POI panel close here
                }

              
              });  //end getCurrentPosition

          }  //no error message (yet) for geolocation turned off or browser - http://www.w3schools.com/html/html5_geolocation.asp
      }); //end click event

    //Add Zoom Home image as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 10px 5px 5px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'rgba(102,102,102,0.80)';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.borderColor = '#D2D4D7';
      controlUI.style.cursor = 'pointer';
      controlUI.style.width = '26px';
      controlUI.style.height = '26px';

      
      //Add image to control
      var myLogo = document.createElement("img");
          myLogo.src = "images/homeWhite2.png";
          myLogo.style.width = '20px';
          myLogo.style.height = '20px';
          myLogo.style.margin = '3px 0px 0px 3px';
          myLogo.title = "Zoom to all development opportunities";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add control to map
      gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

      // Set click event
      google.maps.event.addDomListener(controlUI, 'click', function() {
        gmap.fitBounds(bounds);
      });

      
    //End Zoom Home as a control------------------------

    //Add 45 control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 10px 5px 5px';
       
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'rgba(102,102,102,0.80)';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.borderColor = '#D2D4D7';
      controlUI.style.cursor = 'pointer';
      controlUI.style.width = '26px';
      controlUI.style.height = '26px';
      
      //Add image to control
      var myLogo = document.createElement("img");
          myLogo.src = "images/extrude20.png";
          myLogo.style.width = '20px';
          myLogo.style.height = '20px';
          myLogo.style.margin = '3px 0px 0px 3px';
          myLogo.title = "Zoom to oblique view";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add control to map
      gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

      // Set click event
      google.maps.event.addDomListener(controlUI, 'click', function() {
        gmap.setZoom(18);
        gmap.setMapTypeId(google.maps.MapTypeId.HYBRID);
      });
    //End 45 as a control------------------------

    //Add Map Rotate control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 10px 5px 5px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'rgba(102,102,102,0.80)';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.borderColor = '#D2D4D7';
      controlUI.style.cursor = 'pointer';
      
      //Add image to control
      // FREE: http://iconizer.net/en/search/No-license-filtering/0-128/1/play
      var myLogo = document.createElement("img");
          myLogo.id = 'rotateButton';  //for later swapping of images
          myLogo.src = "images/play.png";
          myLogo.style.width = '20px';
          myLogo.style.height = '20px';
          myLogo.style.margin = '3px 3px 0px 3px';
          myLogo.title = "Auto rotate map";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add control to map
      gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

      // Set click event
      google.maps.event.addDomListener(controlUI, 'click', function() {
        autoRotate(0);
      });



    //Add overlay to map to get pixel location for mouse hover
    overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(gmap); //add empty OverlayView and link the map div to the overlay 

    //for updating map extent to marker extent
    bounds = new google.maps.LatLngBounds();

  }

//SEE http://api.jquery.com/jquery.getjson/ for possible jQuery replacement
			
  function getFilePreventCache() {
      //The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
      var xhrArgs = {
          url: "Downtown.txt",
          handleAs: "json",
          preventCache: true,
          load: function(jsonData) {

            dataAll = jsonData; //set global variable for later queries
            //Sort data by ...
            //var dataQuery = dojox.json.query("$.items[/Group,/Category,/Name]",jsonData);
            //var dataQuery = dojox.json.query("$.items[/Group,/Name]",jsonData);
            //var dataQuery = dojox.json.query("$.items[/Group,/ID_TXT]",jsonData);
            var dataQuery = dojox.json.query("$.items[/Group,/ID]",jsonData);

             //Tab panel variables
              var theCommercial = "";
              var theResidential = "";
              var theMixedUse = "";
              var theAmenities = "";

              var myID = 0;  //id link between sidebar & markers - will be different from record number if any filtering occurs

                      
              
              //Format the data into html - loop through each record
              for (var i=0; i<dataQuery.length; i++) {
                // only attempt to add markers with Latitude & Longitude (or Do_Not_Show)
                 if (dataQuery[i].Latitude >0 && dataQuery[i].Longitude <0 && dataQuery[i].Do_Not_Show!='x' && dataQuery[i].Do_Not_Show!='X') {

                  //Location image
                  if (dataQuery[i].Image!= "") {
                      var locationImage = dataQuery[i].Image;
                  } else {
                      var locationImage = "NotAvailable";
                  }
                   //SUMMARY
                  var sum_content = "<div style='color:rgb(56,64,142); font-weight:bold; font-style:italic; text-align:center; '>" + dataQuery[i].Group + "</div>";
                      sum_content += "<div style=\"text-align:center;\"><b>" +  dataQuery[i].Name + "</b>";
                      sum_content += "<br><img src=\"images/locations/" + locationImage + "T.jpg\" style=\"width:75px;height:100px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\" />";
                      sum_content += "<br><i>Click marker for details</i></div>";

                  //TITLE BAR
                  var title_content = "<span style='color:rgb(56,64,142);'>" + dataQuery[i].Group + "</span>"
                      title_content += "<span>";
                        if (dataQuery[i].Name != "") {
                         title_content += " - <i>" + dataQuery[i].Name + "</i>"; 
                        }
                      title_content += "</span>";


                //DETAILED DESCRIPTIONS---------------------------------------
                  //var detail_content = "<div style='clear:both;width: 475px;'>";  //start address header - optimal width for IE varies screen size????
                  var detail_content = "<div style='clear:both;width: 330px;'>";  //start address header - for mobile 
                       detail_content += "<div style='clear:both;'>";
                       detail_content += "<span style='color:rgb(56,64,142);'>" + dataQuery[i].Address + "</span>";
                        //add a second line to long addresses
                        if (dataQuery[i].length>19) {
                          detail_content += "<br>";
                        }
  
                        //Address fixes for links
                        //remove extra notes from address and use first item in resulting array - , & (
                        var iAddress = dataQuery[i].Address.split(/,|\(/)[0];  //address for Itinerary & Get Directions
                        //replace &
                        iAddress = iAddress.replace("&","and")
                        detail_content += "&nbsp;|&nbsp;<a href=\"http://maps.google.com/maps?daddr=" + iAddress + ", Tacoma, WA\" target='_blank' title='Get driving directions.'>Directions</a>";
  
                        //Zoom to location
                        detail_content += "&nbsp;|&nbsp;<a href='javascript:go2studio(" + dataQuery[i].Latitude + ", " + dataQuery[i].Longitude + ")' title='Close this window and zoom map to location.'>Zoom</a>";

                        //Street View - links directly to Google Maps no longer work (view points north)
                        detail_content += "&nbsp;|&nbsp;<a href='javascript:toggleStreetView(" + dataQuery[i].Latitude + ", " + dataQuery[i].Longitude + ")'  title='View location from nearest street.'>Street</a>";
                        
                        //Print Page - option only for Opportunities
                        if (dataQuery[i].Group == 'Opportunity') {
                          detail_content += "&nbsp;|&nbsp;<a title='Printable summary' href='javascript:printPage(" + dataQuery[i].ID + ")'>Print</a>";
                        };

                        detail_content += "<br></div>";  //end address header

                      //Separator
                      detail_content += "<div style='clear:both;'><hr color='#ACB1DB'></div>";

                      //Image
                      //detail_content += "<div style='clear:both;float:left;width:200px;'>";
                      detail_content += "<div style='clear:both;float:left;width:100px;'>";
                     
                        //format lightbox string for names like D'Agostino, Chandler O'Leary
                        detail_content += "<a href=\"javascript:myLightbox('images/locations/" + locationImage + ".jpg','" +  dataQuery[i].Name.replace(/'/g,"\\'") + "')\"><img style ='float:left;margin:2px 5px 5px 5px;border:solid 1px #999;padding:2px' src=\"images/locations/" + locationImage + "T.jpg\" title='Click to enlarge photo' height='100px' width='75px'></a>";

                      detail_content += "</div>";
  

                      // Add details - loop through all fields                 
                      detail_content += "<div style='float:left; width:210px;'>";

                      var p = dataQuery[i];
                        
                      for(key in p) {
                        //Don't show all fields
                        if (key!="Group" && key!="Category" && key!="Name" && key!="Latitude" && key!="Longitude" && key!="Address" && key!="Image" && key!="ID" && key!="who" ) {
                          //Don't show blank fields (empty values)
                          if (p[key]!="" && p[key]!="N/A") {
                            detail_content +=  "<br><b>" + key + ":  </b>" + p[key];
                          }
                        }
                      } 
 
                      //End Artist dev
                      //detail_content += "</div>";
                      detail_content += "<br>&nbsp;</div>";

                    detail_content += "</div>";
                    
                //end DETAILED DESCRIPTIONS-------------------------------------

                      //Set marker color

                      var imageIcon = ""; 
                      var part1 = "<div style='clear:both;height:5px;'></div>";  //clear divider
                      var part2 = "<div style='clear:both;float:left;'><img src='images/mapIcons/";

                      // Insert imageIcon between part2 & part3 during if-then check
                      var part3 = "'  ></div>";

                      //Image or placeholder
                      //if (locationImage != 'NotAvailable') {
                        var part3b = "<div style='float:left;'><img src=\"images/locations/" + locationImage + "T.jpg\" style=\"width:75px;height:100px;margin:2px 5px 0px 5px;border:solid 1px #999;padding:2px\" title=\"" + dataQuery[i].Name + " - Click to enlarge photo\" onclick=\"myLightbox('images/locations/" + dataQuery[i].Image + ".jpg','"  +  dataQuery[i].Name.replace(/'/g,"\\'") +  "')\" onmouseover='google.maps.event.trigger(array_Markers[" + myID + "], \"mouseover\")'  onmouseout='google.maps.event.trigger(array_Markers[" + myID + "], \"mouseout\")' /></div>";
                      //} else {
                        //var part3b = "";
                      //}
                      

                      //var part4 = "<div style='float:left;width:250px;'><b>" +  dataQuery[i].Name + "</b><br>" +  dataQuery[i].Description +  "</div>";
                      var part4 = "<div style='padding:2px; margin: 2px;'><b>" +  dataQuery[i].Name + "</b><br>" +  dataQuery[i].Description +  "</div>";
                          part4 += "<div style='clear:both;'><a title='Zoom map to location and toggle Street & Aerial View' href='javascript:toggleStreetView(" + dataQuery[i].Latitude + ", " + dataQuery[i].Longitude + ")' >Street & Aerial</a>";
                          //part4 += " | <a title='Zoom to location and auto rotate Aerial View' href='javascript:autoRotate(" + dataQuery[i].Latitude + ", " + dataQuery[i].Longitude + ")' >Auto Rotate <img src='images/AutoRotate.png' style='border-style: none'></a> | <a title='Stop rotating Aerial View' href='javascript:myStopFunction()' >Stop Rotate <img src='images/Stop.png' style='border-style: none'></a>";

                      //var part4b = "<br><center><a href='javascript:google.maps.event.trigger(array_Markers[" + myID + "], \"click\")' title='View complete property details.'>Details</a> | <a title='Printable summary' href='javascript:printPage(" + dataQuery[i].ID + ")'>Printable Details</a></center>";
                      var part4b = " | <a href='javascript:google.maps.event.trigger(array_Markers[" + myID + "], \"click\")' title='View complete property details.'>Details</a> | <a title='Printable summary' href='javascript:printPage(" + dataQuery[i].ID + ")'>Printable</a></center>";

                      var part5 = "</div><div style='clear:both;'><hr color='#ACB1DB'></div>";  //color divider
                      
                      if (dataQuery[i].Group=="Amenity") {    //Yellow - Amenities
                          imageIcon = "Y" + theMixedUseCount + ".png";
                          //theMixedUse += part1 + part2 + imageIcon + part3 + part4 + part5;
                          theMixedUse += part1 + part2 + imageIcon + part3 + part3b + part4 + part5;
                          theMixedUseCount = theMixedUseCount + 1;
                      } else if (dataQuery[i].Group=="Key Buildings") {    //Pink - Developments
                          imageIcon = "P" + theResidentialCount + ".png";
                          //theResidential += part1 + part2 + imageIcon + part3 + part4 + part5;
                          theResidential += part1 + part2 + imageIcon + part3 + part3b + part4 + part5;
                          theResidentialCount = theResidentialCount + 1;
                      } else if (dataQuery[i].Group=="Culture") {    //Green - Culture
                          imageIcon = "G" + theAmenitiesCount + ".png";
                          theAmenities += part1 + part2 + imageIcon + part3 + part3b + part4 + part5;
                          theAmenitiesCount = theAmenitiesCount + 1;
                      } else if (dataQuery[i].Group=="Opportunity") {   //Blue (cyan) - Opportunities
                          imageIcon = "C" + theCommercialCount + ".png";
                          theCommercial += part1 + part2 + imageIcon + part3 + part3b + part4 + part4b + part5;
                          theCommercialCount = theCommercialCount + 1;
                      }

                    //Add marker to map - just one per studio
                    addMarker(dataQuery[i].Latitude, dataQuery[i].Longitude, sum_content, detail_content, title_content, imageIcon);

                    //Extend map extent
                    bounds.extend(new google.maps.LatLng(dataQuery[i].Latitude, dataQuery[i].Longitude));
                    
                    myID = myID + 1;     //increment marker id counter - for mouseover & click events with tab 

                }
                
              }


            //update thumbnail panels
            dojo.byId("Commercial1").innerHTML = theCommercial;
            dojo.byId("Residential1").innerHTML = theResidential;
            dojo.byId("MixedUse1").innerHTML = theMixedUse;
            dojo.byId("Amenities1").innerHTML = theAmenities;

            //Adjust map extent to all markers
            gmap.fitBounds(bounds); 

            
            google.maps.event.addListenerOnce(gmap, 'idle', function(){
                //Open side panel (initially closed to get correct maximized map image)
                  //Start with map max size (otherwise blank tiles), then toggle POI jQuery panel open
                  $('.show').click();  

            });

          },
          error: function(error) {
              alert("An unexpected error occurred: " + error);
          }
      }

      //Call the asynchronous xhrGet - asynchronous call to retrieve data
      var deferred = dojo.xhrGet(xhrArgs);
  }



  function addMarker(Latitude, Longitude, sum, info, title, imageIcon) {
    var location = new google.maps.LatLng(Latitude, Longitude);

    var myMarker = new google.maps.MarkerImage('images/mapIcons/' + imageIcon,
        new google.maps.Size(20, 20),
        new google.maps.Point(0,0),
        new google.maps.Point(0, 20));

    //Add marker to map
    var marker = new google.maps.Marker({
      position: location,
      shadow: shadow,
      icon: myMarker,
      shape: shape,
      optimized: false,  //so draggable marker can be put behind theses markers
      map: gmap
    });

    //Add marker events
    google.maps.event.addListener(marker, 'mouseover', function() {
      //show popup, highlight marker if currently visible on map - no popups if zoomed in, etc
      if (gmap.getBounds().contains(marker.getPosition())) {
      
        marker.setIcon(imageOver);  //highlight marker

      //map tip - summary window
        var evt = marker.getPosition();
        var containerPixel = overlay.getProjection().fromLatLngToContainerPixel(evt);

        closeDialog();  //close any open map tips

        var dialog = new dijit.TooltipDialog({
          id: "tooltipDialog",
          content: sum,
          style: "position: absolute;z-index:100"
        });

        dialog.startup();
        dojo.style(dialog.domNode, "opacity", 0.85);
        //summary popup offset
        dijit.placeOnScreen(dialog.domNode, {x: containerPixel.x, y: containerPixel.y}, ["BL","TL","BR","TR"], {x: 15, y: 10});
      }
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      marker.setIcon(myMarker);
      closeDialog();
    });

    google.maps.event.addListener(marker, 'click', function() {
      myDialog(info, title);
    });

    //for clickable side panel - started w/ record 0, so first one pushed in is i=1
    array_Markers.push(marker);

  }

  function closeDialog() {
    //close any open map tips
    var widget = dijit.byId("tooltipDialog");
    if (widget) {
      widget.destroy();
    }
  }
      
  function myDialog(info, title){
    myDlg = new dijit.Dialog({
        draggable: false
    });
    //add additional attributes...
    myDlg.titleNode.innerHTML = title;
    myDlg.attr("content", info);
    myDlg.show();

    //Close dialog when underlay (outside window) is clicked
    dojo.connect(dijit._underlay , "onClick", function(e){ myDlg.destroy(); });

  }


  function myLightbox(url,title){
   dialog.show({ href: url, title:title});
  }


  function PrintContent(){
    var DocumentContainer = document.getElementById("directionsPanel");
    var WindowObject = window.open('', 'PrintWindow','width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
    WindowObject.document.writeln(DocumentContainer.innerHTML);
    WindowObject.document.close();
    WindowObject.focus();
    WindowObject.print();
  }

  function go2studio(lat,lon) {
    //Close dialog when underlay (outside window) is clicked

  if( dojo.exists("myDlg") ){
    //Close open details dialog
    myDlg.destroy();
  }

    //New map limits
    var studio_bounds = new google.maps.LatLngBounds();
    var studio_location = new google.maps.LatLng(lat,lon);
        studio_bounds.extend(studio_location);
        gmap.setZoom(20); //max zoom
        gmap.setCenter(studio_bounds.getCenter());
  }

  function printPage(id) {
  //http://www.smashingmagazine.com/2015/01/designing-for-print-with-css/
  //Query text file - only Opportunities
  var jsonData = dojox.json.query("$.items[?Group=='Opportunity' & Do_Not_Show=='' & ID==" + id + "]",dataAll);  //query data to get json

  //ID must be a text field for the following to work
  var markerIconPrint =((jsonData[0].ID.charAt(0))==0) ? jsonData[0].ID.charAt(1) : jsonData[0].ID;       //remove leading zero
  var detail_content = "<div style='width: 500px;text-align:center;'><img src='images/mapIcons/C" + markerIconPrint +".png'><b>" + jsonData[0].Name + "</b></div>"
  detail_content += "<div style='width: 500px;text-align:center;'><i>" + jsonData[0].Address + "</i></div>";

  //Image
  detail_content += "<div style='clear:both;width:500px;'>";
    detail_content += "<center><img style ='width: 500px;' src='images/locations/" + jsonData[0].Image +".jpg'></center>";
  detail_content += "</div>"

              detail_content += "<div style='float:left;width:240px;padding:5px;'>";

                      // Add details - loop through all fields                 
                      var p = jsonData[0];
                        
                      for(key in p) {
                        //Don't show all fields
                        if (key!="Group" && key!="Category" && key!="Name" && key!="Latitude" && key!="Longitude" && key!="Address" && key!="Image" && key!="ID" && key!="who" ) {
                          //Don't show blank fields (empty values)
                          if (p[key]!="" && p[key]!="N/A") {
                            if (key=="Description") {      //last field
                               detail_content += "</div><div style='float:right; width:240px;padding:5px;'><span style='color:#615B6F;font-weight: bold;'>" + key + ": </span>" + p[key] + "<br></div>";
                            } else {
                               detail_content += "<span style='color:#615B6F;font-weight: bold;'>" + key + ": </span>" + p[key] + "<br>";
                            } 
                          }
                        }
                      } 
                

              //End details
            
            
  myText = "<html><HEAD><TITLE>Downtown Tacoma Development Opportunities</TITLE></HEAD><body>";
  myText += "<font face=verdana> <font size=-2><center><div style='width: 500px;background-color:#E9E5DC;padding:5px;margin-right: auto;margin-left: auto;text-align: left;'>";

  myText += "<div style='width: 500px;background-color:#C3BDAD;padding:2px 0px 2px 0px;text-align:center;margin-right:auto;margin-left:auto;'><b>Downtown Tacoma Development Opportunities</b></div>";

  myText += detail_content;
  myText += "<img src='http://maps.google.com/maps/api/staticmap?center=";
  myText += jsonData[0].Latitude + "," + jsonData[0].Longitude;

  myText += "&zoom=16&size=500x350&maptype=hybrid&markers=color:blue|";
  myText += jsonData[0].Latitude + "," + jsonData[0].Longitude;
  myText += "&sensor=false' border=1></body></html>";
  myWindow=window.open('','','');
  myWindow.document.write(myText);
  myWindow.focus();

}

//Start Street View functions    -----------------------------------------------
function toggleStreetView(newLat,newLong) {
  var toggle = panorama.getVisible();   //Check if Street View is on

   //turn on aerial imagery & set 45-degree imagery
  gmap.setMapTypeId(google.maps.MapTypeId.HYBRID);
  gmap.setTilt(45);

  if (currentLat != newLat && currentLong != newLong ) {
   toggle = false; //user has street view on, but wants street view for new location
  }

  if (toggle == false) {
    
    addLatLng = new google.maps.LatLng(newLat,newLong);   //coord for new location

    //Zoom map to location
    var studio_bounds = new google.maps.LatLngBounds();
        studio_bounds.extend(addLatLng);
        gmap.setZoom(20); //max zoom
        gmap.setCenter(studio_bounds.getCenter());

    //Get Street View for location
    var service = new google.maps.StreetViewService();
    service.getPanoramaByLocation(addLatLng, 50, showPanoData);

  } else {
    panorama.setVisible(false);    //Turn off Street View
  }

  //set current lat/long for later check
  currentLat = newLat;
  currentLong = newLong;


}

function showPanoData(panoData, status) {
    if (status != google.maps.StreetViewStatus.OK) {
      alert("Street View data not found for this location.");
      return;
    }
    var angle = computeAngle(addLatLng, panoData.location.latLng);

    //no max screen control button available yet
    var panoOptions = {
	    position: addLatLng,
	    addressControl: true,
	    linksControl: true,
	    panControl: true,
	    zoomControlOptions: {
		   style: google.maps.ZoomControlStyle.SMALL
	    },
	    pov: {
  			heading: angle,
  			pitch: 10,
  			zoom: 0
	    },
	    enableCloseButton: true,
      imageDateControl: true,
	    visible:true
    };

panorama.setOptions(panoOptions);
}

	function computeAngle(endLatLng, startLatLng) {
      var DEGREE_PER_RADIAN = 57.2957795;
      var RADIAN_PER_DEGREE = 0.017453;

      var dlat = endLatLng.lat() - startLatLng.lat();
      var dlng = endLatLng.lng() - startLatLng.lng();
      // We multiply dlng with cos(endLat), since the two points are very closeby,
      // so we assume their cos values are approximately equal.
      var yaw = Math.atan2(dlng * Math.cos(endLatLng.lat() * RADIAN_PER_DEGREE), dlat)
             * DEGREE_PER_RADIAN;
      return wrapAngle(yaw);
   }

   function wrapAngle(angle) {
		if (angle >= 360) {
		    angle -= 360;
		} else if (angle < 0) {
		    angle += 360;
		}
		return angle;
    }
//end Street View functions     ------------------------------------------------  

//start rotate aerial functions ------------------------------------------------
    function rotate90() {
      var heading = gmap.getHeading() || 0;
      gmap.setHeading(heading - 90);
    }
    
    function autoRotate(newLat,newLong) {
      //check for current button state (play or pause image)
      var str = document.getElementById('rotateButton').src; 
      var n = str.search("pause.png");

      if (n != -1) {
          //just stop the rotation
          myStopFunction();    //stop the rotation
      } else {
          //avoid double-click problems, then rotate
          myStopFunction();    //to avoid any double-click problems - stop & then start again if multiple clicks
          
          //Check for location change
          if (newLat!=0) {
            addLatLng = new google.maps.LatLng(newLat,newLong);   //coord for new location
      
            //Zoom map to location (could check if current lat/long different than newLat,newLong)
            var studio_bounds = new google.maps.LatLngBounds();
                studio_bounds.extend(addLatLng);
                gmap.setZoom(20); //max zoom
                gmap.setCenter(studio_bounds.getCenter());
          }
          
          //Turn off Street View 
          if (gmap.getStreetView().getVisible()) {
              gmap.getStreetView().setVisible(false);    
          }
        
          //Set minimum zoom level
          if (gmap.getZoom()<18) {
             gmap.setZoom(18);    //45-degree available at 18 and higher
          }
          
          //Set 45-degree imagery
          gmap.setMapTypeId(google.maps.MapTypeId.HYBRID);
          gmap.setTilt(45);
        
           //Rotate every 3 seconds
            myRotate=window.setInterval(rotate90, 3000);
            //swap out rotate button image 
            document.getElementById('rotateButton').src = "images/pause.png";
      } //end check for current button state

    }
    
    function myStopFunction(){
      clearInterval(myRotate);
      //swap out rotate button image 
      document.getElementById('rotateButton').src = "images/play.png";
    }

//end rotate aerial functions --------------------------------------------------

  //Load map & sites after dojo load
	require([
    "dojo/parser", 
    "dijit/layout/TabContainer", 
    "dijit/layout/ContentPane",
	  "dojox/json/query", //json query - alternative: http://api.jquery.com/jquery.getjson/
    "dojox/image/Lightbox", // image lightbox    - alternative: https://www.freshdesignweb.com/jquery-lightbox-plugin-image-gallery/
    "dijit/Dialog",  //details window
    "dijit/TooltipDialog",  //summary window
    "dojo/domReady!"
    ], 
  
    function(parser){
  		parser.parse();
        // script code that needs to run after parse
  
        //Create map
        initialize();
        
        //Put locations on map
        getFilePreventCache();
            
        //FF fix for lightbox
        dialog = new dojox.image.LightboxDialog().startup();
        
  	  }
  );
